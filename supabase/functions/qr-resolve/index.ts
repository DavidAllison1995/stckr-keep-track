import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const { qrCodeId } = await req.json();
    
    console.log('=== QR RESOLVE DEBUG ===');
    console.log('Resolving QR code:', qrCodeId);

    // First, find the QR code by code string (not ID)
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', qrCodeId)
      .single();

    console.log('QR code lookup result:', { qrCode, qrError });

    if (qrError || !qrCode) {
      console.error('QR code not found in database:', qrError);
      return Response.json({
        success: false,
        assigned: false,
        error: 'QR code not found',
        redirectUrl: 'https://stckr.io'
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

    console.log('Assignment lookup result:', { assignment, assignmentError });

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

    console.log('Final response:', response);
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