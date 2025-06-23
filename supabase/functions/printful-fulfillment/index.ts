
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
    console.log('Processing Printful fulfillment request');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    console.log('Processing order:', orderId);

    // Get order details with items and products
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq('id', orderId)
      .eq('status', 'paid')
      .single();

    if (orderError || !order) {
      console.error('Order not found or not paid:', orderError);
      throw new Error('Order not found or not paid');
    }

    console.log('Order found:', order);
    console.log('Order items:', order.order_items);

    // Validate that all products have Printful variant IDs
    const invalidProducts = order.order_items.filter((item: any) => 
      !item.product.printful_variant_id
    );

    if (invalidProducts.length > 0) {
      console.error('Products missing Printful variant IDs:', invalidProducts);
      throw new Error('Some products are not configured for Printful fulfillment');
    }

    // Prepare Printful order data
    const printfulItems = order.order_items.map((item: any) => ({
      variant_id: parseInt(item.product.printful_variant_id),
      quantity: item.quantity,
      name: item.product.name,
    }));

    console.log('Printful items prepared:', printfulItems);

    const printfulOrder = {
      external_id: order.id,
      shipping: "STANDARD",
      recipient: {
        name: order.user_email.split('@')[0], // Basic name from email - you'll want to collect actual shipping info
        email: order.user_email,
        // Note: You'll need to collect actual shipping address during checkout
        // For now using placeholder values
        address1: "123 Main St",
        city: "City",
        state_code: "CA",
        country_code: "US",
        zip: "12345"
      },
      items: printfulItems
    };

    console.log('Sending order to Printful:', JSON.stringify(printfulOrder, null, 2));

    // Check if Printful API key is available
    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY');
    if (!printfulApiKey) {
      console.error('PRINTFUL_API_KEY not found in environment variables');
      throw new Error('Printful API key not configured');
    }

    console.log('Printful API key found, making request...');

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
    
    console.log('Printful response status:', printfulResponse.status);
    console.log('Printful response:', JSON.stringify(printfulResult, null, 2));
    
    if (!printfulResponse.ok) {
      console.error('Printful API error:', printfulResult);
      throw new Error(`Printful API error: ${printfulResult.error?.message || 'Unknown error'}`);
    }

    console.log('Printful order created successfully:', printfulResult.result);

    // Update order status to processing and store Printful order ID
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'processing',
        printful_order_id: printfulResult.result.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
    } else {
      console.log('Order status updated to processing with Printful order ID:', printfulResult.result.id);
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
    console.error("Printful fulfillment error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
