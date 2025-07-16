import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { qrCode, itemId, userId } = await req.json();
    
    console.log('=== QR ASSIGN DEBUG ===');
    console.log('QR Code:', qrCode);
    console.log('Item ID:', itemId);
    console.log('User ID:', userId);

    // First find the QR code by its code
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
        error: 'QR code not found'
      }, { headers: corsHeaders, status: 404 });
    }

    // Check if user already has a link for this QR code
    const { data: existingLink, error: existingError } = await supabase
      .from('user_qr_links')
      .select('*')
      .eq('qr_code_id', qrCodeData.id)
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Existing link check:', { existingLink, existingError });

    if (existingError) {
      console.error('Error checking existing QR link:', existingError);
      return Response.json({
        success: false,
        error: 'Error checking existing QR link'
      }, { headers: corsHeaders, status: 500 });
    }

    // Verify item exists and belongs to user
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    console.log('Item verification:', { itemData, itemError });

    if (itemError || !itemData) {
      console.error('Item not found or access denied:', itemError);
      return Response.json({
        success: false,
        error: 'Item not found or access denied'
      }, { headers: corsHeaders, status: 404 });
    }

    if (existingLink) {
      console.log('Updating existing link from item', existingLink.item_id, 'to item', itemId);
      
      // Update existing link to new item
      const { error: updateError } = await supabase
        .from('user_qr_links')
        .update({ item_id: itemId })
        .eq('id', existingLink.id);

      console.log('Update result:', { updateError });

      if (updateError) {
        console.error('Update error:', updateError);
        return Response.json({
          success: false,
          error: 'Failed to update QR link'
        }, { headers: corsHeaders, status: 500 });
      }
    } else {
      console.log('Creating new link');
      
      // Create new link
      const { error: insertError } = await supabase
        .from('user_qr_links')
        .insert({
          user_id: userId,
          qr_code_id: qrCodeData.id,
          item_id: itemId
        });

      console.log('Insert result:', { insertError });

      if (insertError) {
        console.error('Insert error:', insertError);
        return Response.json({
          success: false,
          error: 'Failed to create QR link'
        }, { headers: corsHeaders, status: 500 });
      }
    }

    console.log('QR assignment completed successfully');
    
    return Response.json({
      success: true,
      message: 'QR code assigned successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in qr-assign function:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { headers: corsHeaders, status: 500 });
  }
});