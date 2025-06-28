
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
    console.log('Testing Printful API connection...');
    
    // Check if Printful API key is available
    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY');
    if (!printfulApiKey) {
      console.error('PRINTFUL_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Printful API key not configured',
        details: 'API key is missing from environment variables'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log('Printful API key found, testing connection...');

    // Test API connection by getting store info
    const response = await fetch('https://api.printful.com/store', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log('Printful API response status:', response.status);
    console.log('Printful API response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('Printful API error:', result);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Printful API error: ${result.error?.message || 'Unknown error'}`,
        details: result,
        status: response.status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }

    // Test getting products to verify we can access catalog
    console.log('Testing product catalog access...');
    const productsResponse = await fetch('https://api.printful.com/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const productsResult = await productsResponse.json();
    console.log('Products API response status:', productsResponse.status);
    
    if (!productsResponse.ok) {
      console.error('Products API error:', productsResult);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Products API error: ${productsResult.error?.message || 'Unknown error'}`,
        details: productsResult
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: productsResponse.status,
      });
    }

    console.log('Printful API test successful!');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Printful API connection successful',
      storeInfo: result.result,
      productsCount: productsResult.result?.length || 0,
      apiKeyStatus: 'Valid',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Printful API test error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Unexpected error during API test'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
