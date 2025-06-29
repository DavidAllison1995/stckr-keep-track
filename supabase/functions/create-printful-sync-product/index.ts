
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔨 CREATE PRINTFUL SYNC PRODUCT: Starting request');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(authHeader);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ User authenticated:', userData.user.id, userData.user.email);

    // Get Printful API key
    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
    if (!printfulApiKey) {
      console.error('❌ PRINTFUL API KEY NOT FOUND');
      return new Response(JSON.stringify({ 
        error: 'Printful API key not configured',
        details: 'API key is missing from environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body for custom parameters (optional)
    let requestData = {};
    try {
      requestData = await req.json();
    } catch {
      // Use defaults if no body provided
    }

    // Prepare sync product payload with your specifications
    const syncProductPayload = {
      sync_product: {
        name: requestData.name || "Sticker Sheet #1",
        thumbnail: requestData.thumbnail || "https://example.com/images/sticker-sheet-thumb.png",
        external_id: requestData.external_id || "sticker-sheet-001"
      },
      sync_variants: [
        {
          retail_price: requestData.retail_price || "5.00",
          variant_id: requestData.variant_id || 12917,
          files: [
            {
              type: "default",
              url: requestData.print_file_url || "https://example.com/printfiles/sticker-sheet-design.png"
            }
          ]
        }
      ]
    };

    console.log('📦 SYNC PRODUCT PAYLOAD:', JSON.stringify(syncProductPayload, null, 2));

    // Make API call to Printful
    const response = await fetch("https://api.printful.com/store/products", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(syncProductPayload),
    });

    console.log('📡 PRINTFUL RESPONSE STATUS:', response.status);

    const result = await response.json();
    console.log('🖨️ PRINTFUL RESPONSE:', JSON.stringify(result, null, 2));

    if (response.ok && result.result) {
      // Success - extract the sync variant ID
      const syncProduct = result.result;
      const syncVariant = syncProduct.sync_variants?.[0];
      const syncVariantId = syncVariant?.id;

      console.log('✅ PRINTFUL SYNC PRODUCT CREATED SUCCESSFULLY');
      console.log('🔗 SYNC PRODUCT ID:', syncProduct.id);
      console.log('🔗 SYNC VARIANT ID:', syncVariantId);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Sync product created successfully',
        sync_product_id: syncProduct.id,
        sync_variant_id: syncVariantId,
        external_id: syncProduct.external_id,
        name: syncProduct.name,
        thumbnail: syncProduct.thumbnail_url,
        retail_price: syncVariant?.retail_price,
        full_response: result.result
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Error - log detailed information
      const errorMsg = result.error?.message || result.result || `HTTP ${response.status}: ${response.statusText}` || "Unknown Printful error";
      
      console.error("❌ PRINTFUL API ERROR:", {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        result: result.result,
        code: result.code,
        requestPayload: syncProductPayload,
        fullResponse: result
      });
      
      return new Response(JSON.stringify({ 
        success: false,
        error: `Printful API error (${response.status}): ${errorMsg}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          response: result,
          requestPayload: syncProductPayload
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }
  } catch (error) {
    console.error("❌ SYNC PRODUCT CREATION ERROR:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Unexpected error during sync product creation'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
