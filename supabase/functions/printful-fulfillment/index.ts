import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🖨️ PRINTFUL FULFILLMENT: Starting request processing');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId } = await req.json();
    
    if (!orderId) {
      console.error('❌ PRINTFUL: No order ID provided');
      throw new Error("Order ID is required");
    }

    console.log('🔍 PRINTFUL: Processing order:', orderId);

    // Get order details with items, products, and shipping address
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_addresses (*)
      `)
      .eq('id', orderId)
      .eq('status', 'paid')
      .single();

    if (orderError || !order) {
      console.error('❌ PRINTFUL: Order not found or not paid:', orderError);
      throw new Error('Order not found or not paid');
    }

    console.log('✅ PRINTFUL: Order found:', {
      orderId: order.id,
      email: order.user_email,
      itemCount: order.order_items?.length || 0,
      hasShipping: !!order.shipping_addresses?.[0]
    });

    // Check if we have a shipping address
    const shippingAddress = order.shipping_addresses?.[0];
    if (!shippingAddress) {
      const errorMessage = 'No shipping address found for order';
      console.error('❌ PRINTFUL:', errorMessage);
      
      await supabaseClient
        .from('orders')
        .update({ 
          fulfillment_error: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      throw new Error(errorMessage);
    }

    console.log('🏠 PRINTFUL: Shipping address:', {
      name: shippingAddress.name,
      country: shippingAddress.country,
      city: shippingAddress.city
    });

    // Validate that all products have Printful variant IDs
    const invalidProducts = order.order_items.filter((item: any) => 
      !item.product.printful_variant_id
    );

    if (invalidProducts.length > 0) {
      const errorMessage = `Products missing Printful variant IDs: ${invalidProducts.map((p: any) => p.product.name).join(', ')}`;
      console.error('❌ PRINTFUL: Invalid products:', errorMessage);
      
      await supabaseClient
        .from('orders')
        .update({ 
          fulfillment_error: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      throw new Error('Some products are not configured for Printful fulfillment');
    }

    // Prepare Printful order data
    const printfulItems = order.order_items.map((item: any) => ({
      variant_id: parseInt(item.product.printful_variant_id),
      quantity: item.quantity,
      name: item.product.name,
    }));

    console.log('📦 PRINTFUL: Items prepared:', printfulItems);

    // Enhanced country code mapping for all Printful supported countries
    const getCountryCode = (country: string) => {
      const countryMap: { [key: string]: string } = {
        // North America
        'US': 'US', 'United States': 'US', 'USA': 'US',
        'CA': 'CA', 'Canada': 'CA',
        'MX': 'MX', 'Mexico': 'MX',
        
        // Europe
        'GB': 'GB', 'United Kingdom': 'GB', 'UK': 'GB',
        'DE': 'DE', 'Germany': 'DE', 'Deutschland': 'DE',
        'FR': 'FR', 'France': 'FR',
        'IT': 'IT', 'Italy': 'IT', 'Italia': 'IT',
        'ES': 'ES', 'Spain': 'ES', 'España': 'ES',
        'NL': 'NL', 'Netherlands': 'NL', 'Holland': 'NL',
        'BE': 'BE', 'Belgium': 'BE', 'België': 'BE',
        'AT': 'AT', 'Austria': 'AT', 'Österreich': 'AT',
        'CH': 'CH', 'Switzerland': 'CH', 'Schweiz': 'CH',
        'IE': 'IE', 'Ireland': 'IE',
        'PT': 'PT', 'Portugal': 'PT',
        'LU': 'LU', 'Luxembourg': 'LU',
        
        // Nordic countries
        'SE': 'SE', 'Sweden': 'SE', 'Sverige': 'SE',
        'NO': 'NO', 'Norway': 'NO', 'Norge': 'NO',
        'DK': 'DK', 'Denmark': 'DK', 'Danmark': 'DK',
        'FI': 'FI', 'Finland': 'FI', 'Suomi': 'FI',
        
        // Eastern Europe
        'PL': 'PL', 'Poland': 'PL', 'Polska': 'PL',
        'CZ': 'CZ', 'Czech Republic': 'CZ', 'Czechia': 'CZ',
        'SK': 'SK', 'Slovakia': 'SK',
        'HU': 'HU', 'Hungary': 'HU',
        'SI': 'SI', 'Slovenia': 'SI',
        'HR': 'HR', 'Croatia': 'HR',
        'EE': 'EE', 'Estonia': 'EE',
        'LV': 'LV', 'Latvia': 'LV',
        'LT': 'LT', 'Lithuania': 'LT',
        'RO': 'RO', 'Romania': 'RO',
        'BG': 'BG', 'Bulgaria': 'BG',
        'GR': 'GR', 'Greece': 'GR',
        'CY': 'CY', 'Cyprus': 'CY',
        'MT': 'MT', 'Malta': 'MT',
        
        // Asia-Pacific
        'AU': 'AU', 'Australia': 'AU',
        'NZ': 'NZ', 'New Zealand': 'NZ',
        'JP': 'JP', 'Japan': 'JP',
        'SG': 'SG', 'Singapore': 'SG',
        'HK': 'HK', 'Hong Kong': 'HK',
        'MY': 'MY', 'Malaysia': 'MY',
        'TH': 'TH', 'Thailand': 'TH',
        'KR': 'KR', 'South Korea': 'KR', 'Korea': 'KR',
        
        // Other regions
        'BR': 'BR', 'Brazil': 'BR', 'Brasil': 'BR',
        'IL': 'IL', 'Israel': 'IL',
        'ZA': 'ZA', 'South Africa': 'ZA',
        'IN': 'IN', 'India': 'IN',
        'PH': 'PH', 'Philippines': 'PH',
        'VN': 'VN', 'Vietnam': 'VN',
        'ID': 'ID', 'Indonesia': 'ID',
        'TW': 'TW', 'Taiwan': 'TW',
      };
      return countryMap[country] || country;
    };

    const printfulOrder = {
      external_id: order.id,
      shipping: "STANDARD",
      recipient: {
        name: shippingAddress.name,
        email: order.user_email,
        address1: shippingAddress.line1,
        address2: shippingAddress.line2 || undefined,
        city: shippingAddress.city,
        state_code: shippingAddress.state || undefined,
        country_code: getCountryCode(shippingAddress.country),
        zip: shippingAddress.postal_code
      },
      items: printfulItems
    };

    console.log('📤 PRINTFUL: Sending order to API:', JSON.stringify(printfulOrder, null, 2));

    // Check if Printful API key is available
    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY');
    if (!printfulApiKey) {
      const errorMessage = 'Printful API key not configured';
      console.error('❌ PRINTFUL:', errorMessage);
      
      await supabaseClient
        .from('orders')
        .update({ 
          fulfillment_error: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      throw new Error(errorMessage);
    }

    console.log('🔑 PRINTFUL: API key found, making request...');

    // Send order to Printful
    const printfulResponse = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printfulOrder),
    });

    const printfulResult = await printfulResponse.json();
    
    console.log('📨 PRINTFUL: API response status:', printfulResponse.status);
    console.log('📨 PRINTFUL: API response:', JSON.stringify(printfulResult, null, 2));
    
    if (!printfulResponse.ok) {
      const errorMessage = `Printful API error: ${printfulResult.error?.message || 'Unknown error'}`;
      console.error('❌ PRINTFUL: API Error:', errorMessage);
      
      await supabaseClient
        .from('orders')
        .update({ 
          fulfillment_error: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      throw new Error(errorMessage);
    }

    console.log('✅ PRINTFUL: Order created successfully with ID:', printfulResult.result.id);

    // Update order status to processing and store Printful order ID
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'processing',
        printful_order_id: printfulResult.result.id,
        fulfillment_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ PRINTFUL: Error updating order status:', updateError);
    } else {
      console.log('✅ PRINTFUL: Order status updated to processing with Printful ID:', printfulResult.result.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      printfulOrderId: printfulResult.result.id,
      message: 'Order sent to Printful for fulfillment'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ PRINTFUL FULFILLMENT ERROR:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
