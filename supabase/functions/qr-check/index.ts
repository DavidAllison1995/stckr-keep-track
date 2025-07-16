import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRCheckResponse {
  success: boolean;
  assigned: boolean;
  qrCode: string;
  item?: {
    id: string;
    name: string;
    category: string;
    description?: string;
    photo_url?: string;
    room?: string;
    purchase_date?: string;
    warranty_date?: string;
    notes?: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const qrCode = url.searchParams.get('qrCode');
    const userId = url.searchParams.get('userId');
    
    console.log('=== QR CHECK DEBUG ===');
    console.log('QR Code:', qrCode);
    console.log('User ID:', userId);

    if (!qrCode) {
      return Response.json({
        success: false,
        assigned: false,
        error: 'QR code is required'
      }, { headers: corsHeaders, status: 400 });
    }

    // Find the QR code by its code
    const { data: qrCodeData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', qrCode)
      .single();

    console.log('QR Code lookup result:', { qrCodeData, qrError });

    if (qrError || !qrCodeData) {
      console.error('QR code not found:', qrError);
      return Response.json({
        success: false,
        assigned: false,
        qrCode,
        error: 'QR code not found'
      }, { headers: corsHeaders, status: 404 });
    }

    // If userId is provided, check if this user has this QR code linked
    if (userId) {
      const { data: linkData, error: linkError } = await supabase
        .from('user_qr_links')
        .select(`
          *,
          item:items(*)
        `)
        .eq('qr_code_id', qrCodeData.id)
        .eq('user_id', userId)
        .maybeSingle();

      console.log('User QR link check:', { linkData, linkError });

      if (linkError) {
        console.error('Error checking user QR link:', linkError);
        return Response.json({
          success: false,
          assigned: false,
          qrCode,
          error: 'Error checking QR link'
        }, { headers: corsHeaders, status: 500 });
      }

      if (linkData && linkData.item) {
        return Response.json({
          success: true,
          assigned: true,
          qrCode,
          item: {
            id: linkData.item.id,
            name: linkData.item.name,
            category: linkData.item.category,
            description: linkData.item.description,
            photo_url: linkData.item.photo_url,
            room: linkData.item.room,
            purchase_date: linkData.item.purchase_date,
            warranty_date: linkData.item.warranty_date,
            notes: linkData.item.notes
          }
        }, { headers: corsHeaders });
      }
    }

    // QR code exists but not linked to this user (or no user specified)
    return Response.json({
      success: true,
      assigned: false,
      qrCode
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in qr-check function:', error);
    return Response.json({
      success: false,
      assigned: false,
      error: 'Internal server error'
    }, { headers: corsHeaders, status: 500 });
  }
});