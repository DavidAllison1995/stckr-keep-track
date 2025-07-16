import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRAssignRequest {
  qrCode: string;
  itemId: string;
  userId: string;
}

interface QRAssignResponse {
  success: boolean;
  message?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({
      success: false,
      error: 'Method not allowed'
    }, { headers: corsHeaders, status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { qrCode, itemId, userId }: QRAssignRequest = await req.json();
    
    console.log('=== QR ASSIGN DEBUG ===');
    console.log('QR Code:', qrCode);
    console.log('Item ID:', itemId);
    console.log('User ID:', userId);

    // Validate input
    if (!qrCode || !itemId || !userId) {
      return Response.json({
        success: false,
        error: 'QR code, item ID, and user ID are required'
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
        error: 'Invalid QR code'
      }, { headers: corsHeaders, status: 404 });
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

    // Handle assignment
    if (existingLink) {
      // Update existing link to new item (reassignment)
      if (existingLink.item_id === itemId) {
        // Already assigned to this item - idempotent response
        console.log('QR code already assigned to this item');
        return Response.json({
          success: true,
          message: 'QR code already assigned to this item'
        }, { headers: corsHeaders });
      }

      console.log('Updating existing link from item', existingLink.item_id, 'to item', itemId);
      
      const { error: updateError } = await supabase
        .from('user_qr_links')
        .update({ 
          item_id: itemId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', existingLink.id);

      console.log('Update result:', { updateError });

      if (updateError) {
        console.error('Update error:', updateError);
        return Response.json({
          success: false,
          error: 'Failed to reassign QR code'
        }, { headers: corsHeaders, status: 500 });
      }

      console.log('QR code reassigned successfully');
      return Response.json({
        success: true,
        message: 'QR code reassigned successfully'
      }, { headers: corsHeaders });
    } else {
      console.log('Creating new assignment');
      
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
        
        // Handle unique constraint violation (race condition)
        if (insertError.code === '23505') {
          return Response.json({
            success: false,
            error: 'QR code assignment conflict - please try again'
          }, { headers: corsHeaders, status: 409 });
        }
        
        return Response.json({
          success: false,
          error: 'Failed to assign QR code'
        }, { headers: corsHeaders, status: 500 });
      }

      console.log('QR assignment completed successfully');
      return Response.json({
        success: true,
        message: 'QR code assigned successfully'
      }, { headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error in qr-assign function:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { headers: corsHeaders, status: 500 });
  }
});