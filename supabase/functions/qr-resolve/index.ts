import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export interface QRResolutionResponse {
  success: boolean;
  assigned: boolean;
  qrCode?: string;
  error?: string;
  redirectUrl: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization
function sanitizeInput(input: string): string {
  return input.replace(/[<>\"'%;()&+]/g, '');
}

function validateQRCodeId(qrCodeId: string): boolean {
  return /^[A-Za-z0-9]{6,8}$/.test(qrCodeId);
}

// Rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;
  
  const entry = rateLimitStore.get(clientIP);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    'unknown';

    // Apply rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          assigned: false,
          error: 'Rate limit exceeded',
          redirectUrl: 'https://stckr.io'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { qrCodeId } = await req.json();

    if (!qrCodeId) {
      return new Response(
        JSON.stringify({
          success: false,
          assigned: false,
          error: 'Missing qrCodeId',
          redirectUrl: 'https://stckr.io'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize and normalize the QR code ID to uppercase
    const sanitizedQRCodeId = sanitizeInput(qrCodeId);
    const normalizedCode = sanitizedQRCodeId.toUpperCase();
    
    if (!validateQRCodeId(sanitizedQRCodeId)) {
      // Log potential security issue
      await supabase
        .from('security_audit_log')
        .insert({
          event_type: 'invalid_qr_format',
          event_data: { 
            provided_qr_id: qrCodeId,
            sanitized_qr_id: sanitizedQRCodeId,
            client_ip: clientIP
          },
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent')
        });
    }

    // Check if QR code exists in our registry (optional validation)
    const { data: qrCodeExists } = await supabase
      .from('qr_catalog')
      .select('qr_key')
      .eq('qr_key', normalizedCode)
      .eq('is_active', true)
      .single();

    if (!qrCodeExists) {
      // Log QR code not found for monitoring
      await supabase
        .from('security_audit_log')
        .insert({
          event_type: 'qr_code_not_found',
          event_data: { 
            qr_code_id: normalizedCode,
            client_ip: clientIP
          },
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent')
        });
    }

    // Always redirect to the app at /qr/:code - let the app handle user-specific logic
    // This prevents leaking user data and ensures consistent routing
    const response: QRResolutionResponse = {
      success: true,
      assigned: false, // Never leak assignment status to prevent data exposure
      qrCode: normalizedCode,
      redirectUrl: `https://stckr.io/qr/${normalizedCode}`
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in qr-resolve function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        assigned: false,
        error: 'Internal server error',
        redirectUrl: 'https://stckr.io'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});