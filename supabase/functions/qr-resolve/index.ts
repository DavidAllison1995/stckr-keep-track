import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

function normalizeCode(raw: string): string {
  let s = (raw || "").trim();
  try {
    const u = new URL(s);
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length) s = segs[segs.length - 1];
    const maybeQ = u.searchParams.get("code") || u.searchParams.get("qr") || u.searchParams.get("codeId") || u.searchParams.get("qrCodeId");
    if (maybeQ) s = maybeQ;
  } catch {
    // not a URL
  }
  s = s.split("?")[0].split("#")[0];
  s = s.replace(/[^A-Za-z0-9]/g, "");
  return s.toUpperCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { qrCodeId?: string; code?: string; qr?: string };
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("code") || url.searchParams.get("qr") || url.searchParams.get("codeId") || url.searchParams.get("qrCodeId");
    const fromPath = url.pathname.split("/").filter(Boolean).pop();

    const raw = body.qrCodeId || body.code || body.qr || fromQuery || fromPath || "";
    const code = normalizeCode(raw);

    if (!code) {
      return new Response(
        JSON.stringify({
          success: false,
          assigned: false,
          error: "Valid QR code required",
          redirectUrl: "https://stckr.io",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // IMPORTANT: do NOT try to decide user-specific assignment here.
    // Always steer into the app. The app (with auth) will resolve per-user.
    return new Response(
      JSON.stringify({
        success: true,
        assigned: false,
        qrCode: code,
        redirectUrl: `https://stckr.io/qr/${code}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("qr-resolve error:", e);
    return new Response(
      JSON.stringify({
        success: false,
        assigned: false,
        error: "Internal error",
        redirectUrl: "https://stckr.io",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});