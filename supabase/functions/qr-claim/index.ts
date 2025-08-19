import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

function normalizeCode(raw: string): string {
  let s = (raw || "").trim();
  try {
    const u = new URL(s);
    const qp = u.searchParams.get("code") || u.searchParams.get("qr") || u.searchParams.get("codeId") || u.searchParams.get("qrCodeId");
    if (qp) s = qp;
    else {
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs.length) s = segs[segs.length - 1];
    }
  } catch {
    // not a URL
  }
  s = s.split("?")[0].split("#")[0];
  s = s.replace(/[^A-Za-z0-9]/g, "");
  return s.toUpperCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({})) as { itemId?: string; codeId?: string; code?: string; qr?: string; qrCodeId?: string };

    const codeRaw =
      body.codeId || body.qrCodeId || body.code || body.qr ||
      url.searchParams.get("code") || url.searchParams.get("qr") || url.searchParams.get("codeId") || url.searchParams.get("qrCodeId") ||
      url.pathname.split("/").filter(Boolean).pop() || "";

    const code = normalizeCode(codeRaw);
    if (!code) {
      return new Response(JSON.stringify({ error: "Valid QR code required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      // Return current user's claim (if any)
      const { data, error } = await supabase
        .from("item_qr_links")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("qr_key", code)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        return new Response(JSON.stringify({ error: "Failed to fetch claim" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ claim: data ?? null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const itemId = (body.itemId || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(itemId)) {
        return new Response(JSON.stringify({ error: "Valid item ID required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Call canonical RPC
      const { data, error } = await supabase.rpc("claim_qr_for_item", {
        p_qr_key: code,
        p_item_id: itemId,
      });

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to claim code" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data ?? { success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("qr-claim error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});