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

async function logAuditEvent(supabase: any, eventType: string, userId: string, eventData: any, req: Request) {
  try {
    // Extract IP from headers - handle forwarded IPs properly
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    const cfConnectingIp = req.headers.get('cf-connecting-ip') || '';
    
    // Use the first valid IP found
    let ipAddress = cfConnectingIp || realIp || forwardedFor.split(',')[0] || 'unknown';
    ipAddress = ipAddress.trim();
    
    // If IP contains multiple addresses, take only the first valid one
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    
    // Validate IP format (basic check)
    if (!ipAddress || ipAddress === 'unknown' || ipAddress.includes(' ')) {
      ipAddress = '127.0.0.1'; // fallback
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';

    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      user_id: userId,
      event_data: eventData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (auditError) {
    console.error('Audit log error:', auditError);
    // Don't fail the main operation due to audit logging issues
  }
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

    const canonicalKey = normalizeCode(codeRaw);
    
    console.log(`QR claim: raw="${codeRaw}" -> canonical="${canonicalKey}"`);
    
    if (!canonicalKey) {
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

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    // Verify user
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" || (req.method === "POST" && (body as any)?.action === "get")) {
      // Check current user's claim using new schema
      const { data, error } = await supabase
        .from("qr_codes")
        .select("claimed_item_id, claimed_by_user_id")
        .eq("qr_key_canonical", canonicalKey)
        .eq("claimed_by_user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching QR claim:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch claim" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        claim: data?.claimed_item_id ? { item_id: data.claimed_item_id } : null 
      }), {
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

      // Use new RPC
      const { data, error } = await supabase.rpc("claim_qr_for_item_v2", {
        p_qr_key: canonicalKey,
        p_item_id: itemId,
      });

      if (error) {
        console.error("Error claiming QR code:", error);
        await logAuditEvent(supabase, 'qr_claim_failed', user.id, {
          qr_key: canonicalKey,
          item_id: itemId,
          error: error.message
        }, req);
        
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log successful claim
      await logAuditEvent(supabase, 'qr_claim_success', user.id, {
        qr_key: canonicalKey,
        item_id: itemId
      }, req);

      console.log(`QR code claimed successfully: ${canonicalKey} by user: ${user.id}`);

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