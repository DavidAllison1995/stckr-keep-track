
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 VALIDATING PRINTFUL VARIANT ID...');
    
    const { variantId } = await req.json();
    
    if (!variantId) {
      throw new Error("Variant ID is required");
    }

    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
    if (!printfulApiKey) {
      throw new Error("Printful API key not configured");
    }

    console.log('🧪 TESTING VARIANT ID:', variantId);
    console.log('🔑 API KEY PREFIX:', printfulApiKey.substring(0, 10) + "...");

    // Test the variant ID using Printful's API endpoint
    const response = await fetch(`https://api.printful.com/products/variant/${variantId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log('📡 PRINTFUL RESPONSE STATUS:', response.status);
    console.log('📡 PRINTFUL RESPONSE HEADERS:', JSON.stringify([...response.headers.entries()]));

    const result = await response.json();
    console.log('🖨️ COMPLETE PRINTFUL RESPONSE:', JSON.stringify(result, null, 2));

    if (response.ok && result.result) {
      console.log('✅ VARIANT ID IS VALID!');
      console.log('📦 VARIANT DETAILS:', {
        id: result.result.id,
        name: result.result.name,
        product: result.result.product?.name,
        price: result.result.price,
        currency: result.result.currency,
        availability_status: result.result.availability_status
      });
      
      return new Response(JSON.stringify({
        valid: true,
        variant: result.result,
        message: 'Variant ID is valid and found in Printful'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('❌ VARIANT ID NOT FOUND OR INVALID');
      console.log('📋 ERROR DETAILS:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        result: result.result
      });
      
      return new Response(JSON.stringify({
        valid: false,
        error: result.error?.message || result.result || 'Variant not found',
        status: response.status,
        message: 'Variant ID was not found in Printful'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 so we can handle the validation result
      });
    }

  } catch (error) {
    console.error('❌ VALIDATION ERROR:', error);
    return new Response(JSON.stringify({
      valid: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
