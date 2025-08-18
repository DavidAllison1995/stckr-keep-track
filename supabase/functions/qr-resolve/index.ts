import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

interface QRResolutionResponse {
  success: boolean;
  assigned: boolean;
  item?: {
    id: string;
    name: string;
    userId: string;
  };
  qrCode?: string;
  error?: string;
  redirectUrl: string;
}

// Input validation and sanitization
function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&]/g, '').trim().substring(0, 255);
}

function validateQRCodeId(qrCodeId: string): boolean {
  // QR codes should be alphanumeric, 6-8 characters
  return /^[A-Za-z0-9]{6,8}$/.test(qrCodeId);
}

// Rate limiting storage (simple in-memory for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 60; // 60 requests per minute per IP

  const current = rateLimitStore.get(clientIP) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  rateLimitStore.set(clientIP, current);
  return current.count <= maxRequests;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    console.warn('Rate limit exceeded for IP:', clientIP);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.',
        assigned: false,
        redirectUrl: 'https://stckr.io'
      }),
      { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { qrCodeId } = body;
    
    if (!qrCodeId || typeof qrCodeId !== 'string') {
      console.error('Invalid QR Code ID provided:', qrCodeId, 'from IP:', clientIP);
      return Response.json({
        success: false,
        assigned: false,
        error: 'Valid QR Code ID is required',
        redirectUrl: 'https://stckr.io/qr/invalid'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const sanitizedQRCodeId = sanitizeInput(qrCodeId);
    
    if (!validateQRCodeId(sanitizedQRCodeId)) {
      console.error('Invalid QR Code format:', sanitizedQRCodeId, 'from IP:', clientIP);
      return Response.json({
        success: false,
        assigned: false,
        error: 'Invalid QR Code format',
        redirectUrl: 'https://stckr.io/qr/invalid'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }
    
    console.log('=== QR RESOLVE REQUEST ===');
    console.log('Resolving QR code:', sanitizedQRCodeId, 'from IP:', clientIP);

    // First, find the QR code by code string (not ID)
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', sanitizedQRCodeId)
      .single();

    console.log('QR code lookup result:', { found: !!qrCode, error: qrError?.message });

    if (qrError || !qrCode) {
      console.error('QR code not found in database:', qrError?.message);
      
      // Log security event for audit trail
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseAdmin.from('security_audit_log').insert({
        event_type: 'qr_code_not_found',
        event_data: { 
          qr_code_id: sanitizedQRCodeId, 
          client_ip: clientIP,
          user_agent: req.headers.get('user-agent') || 'unknown'
        },
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent')
      }).catch(err => console.error('Audit log error:', err));
      
      return Response.json({
        success: false,
        assigned: false,
        error: 'QR code not found',
        redirectUrl: `https://stckr.io/qr/${sanitizedQRCodeId}`
      }, { headers: corsHeaders });
    }

    // Check if this QR code is assigned to any item
    const { data: assignment, error: assignmentError } = await supabase
      .from('user_qr_links')
      .select(`
        *,
        item:items(*),
        qr_code:qr_codes(*)
      `)
      .eq('qr_code_id', qrCode.id)
      .maybeSingle();

    console.log('Assignment lookup result:', { assigned: !!assignment, error: assignmentError?.message });

    if (assignmentError) {
      console.error('Error checking assignment:', assignmentError);
      return Response.json({
        success: false,
        assigned: false,
        error: 'Error checking assignment',
        redirectUrl: 'https://stckr.io'
      }, { headers: corsHeaders });
    }

    const response: QRResolutionResponse = {
      success: true,
      assigned: !!assignment,
      qrCode: qrCode.code,
      redirectUrl: assignment 
        ? `https://stckr.io/item/${assignment.item_id}`
        : `https://stckr.io/qr/${qrCode.code}`
    };

    if (assignment) {
      response.item = {
        id: assignment.item.id,
        name: assignment.item.name,
        userId: assignment.user_id
      };
    }

    console.log('QR resolve completed successfully for:', sanitizedQRCodeId);
    return Response.json(response, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in qr-resolve function:', error);
    return Response.json({
      success: false,
      assigned: false,
      error: 'Internal server error',
      redirectUrl: 'https://stckr.io'
    }, { headers: corsHeaders, status: 500 });
  }
});