
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

    // Log API key info (first and last 4 characters for security)
    console.log(`API key found - starts with: ${printfulApiKey.substring(0, 4)}... ends with: ...${printfulApiKey.substring(printfulApiKey.length - 4)}`);
    console.log(`API key length: ${printfulApiKey.length}`);

    // Test with a simpler endpoint first - get products instead of store info
    console.log('Testing with products endpoint...');
    const response = await fetch('https://api.printful.com/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Lovable-App/1.0'
      },
    });

    const result = await response.json();
    
    console.log('Printful API response status:', response.status);
    console.log('Printful API response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Printful API response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('Printful API error:', result);
      
      // Try to get more specific error information
      let errorMessage = 'Unknown error';
      if (result.error && result.error.message) {
        errorMessage = result.error.message;
      } else if (result.result && typeof result.result === 'string') {
        errorMessage = result.result;
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: `Printful API error (${response.status}): ${errorMessage}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          response: result,
          apiKeyPrefix: printfulApiKey.substring(0, 8) + '...',
          apiKeyLength: printfulApiKey.length
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }

    console.log('Printful API test successful!');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Printful API connection successful',
      productsCount: result.result?.length || 0,
      apiKeyStatus: 'Valid and working',
      apiKeyPrefix: printfulApiKey.substring(0, 8) + '...',
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
      details: 'Unexpected error during API test',
      stack: error.stack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
