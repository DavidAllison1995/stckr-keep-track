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
    console.log('🔍 BROWSING PRINTFUL CATALOG...');
    
    const { productId, search } = await req.json();
    
    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
    if (!printfulApiKey) {
      throw new Error("Printful API key not configured");
    }

    console.log('🔑 API KEY PREFIX:', printfulApiKey.substring(0, 10) + "...");

    // If productId is provided, get specific product variants
    if (productId) {
      console.log('📦 FETCHING PRODUCT VARIANTS FOR ID:', productId);
      
      const response = await fetch(`https://api.printful.com/products/${productId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${printfulApiKey}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log('📡 PRINTFUL PRODUCT RESPONSE:', JSON.stringify(result, null, 2));

      if (response.ok && result.result) {
        return new Response(JSON.stringify({
          success: true,
          product: result.result.product,
          variants: result.result.variants || [],
          message: `Found ${result.result.variants?.length || 0} variants for product ${productId}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        throw new Error(result.error?.message || 'Product not found');
      }
    }

    // Otherwise, get list of all products
    console.log('📋 FETCHING ALL PRINTFUL PRODUCTS...');
    
    const response = await fetch("https://api.printful.com/products", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log('📡 PRINTFUL PRODUCTS RESPONSE:', JSON.stringify(result, null, 2));

    if (response.ok && result.result) {
      let products = result.result;
      
      // Filter by search term if provided
      if (search) {
        products = products.filter((product: any) => 
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return new Response(JSON.stringify({
        success: true,
        products: products,
        count: products.length,
        message: `Found ${products.length} products`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(result.error?.message || 'Failed to fetch products');
    }

  } catch (error) {
    console.error('❌ CATALOG BROWSE ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
