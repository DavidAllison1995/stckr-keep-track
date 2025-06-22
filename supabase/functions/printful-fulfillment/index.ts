
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

    // Prepare Printful order data
    const printfulItems = order.order_items.map((item: any) => ({
      variant_id: item.product.printful_variant_id,
      quantity: item.quantity,
      name: item.product.name,
    }));

    const printfulOrder = {
      external_id: order.id,
      shipping: "STANDARD", // You can make this configurable
      recipient: {
        name: order.user_email.split('@')[0], // Basic name from email
        email: order.user_email,
        // You'll want to collect shipping address during checkout
        address1: "123 Main St", // Placeholder - you'll need to collect this
        city: "City",
        state_code: "CA",
        country_code: "US",
        zip: "12345"
      },
      items: printfulItems
    };

    console.log('Sending order to Printful:', printfulOrder);

    // Send order to Printful
    const printfulResponse = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PRINTFUL_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printfulOrder),
    });

    const printfulResult = await printfulResponse.json();
    
    if (!printfulResponse.ok) {
      console.error('Printful API error:', printfulResult);
      throw new Error(`Printful API error: ${printfulResult.error?.message || 'Unknown error'}`);
    }

    console.log('Printful order created:', printfulResult.result);

    // Update order status to processing
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      printfulOrderId: printfulResult.result.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Printful fulfillment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
