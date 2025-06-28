
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
    console.log('🖨️ PRINTFUL FULFILLMENT: Starting manual retry');
    
    const { orderId } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order details
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
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    console.log('📦 RETRYING ORDER:', order.id);

    // Get Printful API key
    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
    if (!printfulApiKey) {
      throw new Error("Printful API key not configured");
    }

    // Prepare items for Printful
    const printfulItems = order.order_items
      .filter((item: any) => item.product?.printful_variant_id)
      .map((item: any) => ({
        variant_id: parseInt(item.product.printful_variant_id),
        quantity: item.quantity,
      }));

    if (printfulItems.length === 0) {
      throw new Error("No Printful items found in order");
    }

    // Get shipping address
    const shippingAddress = order.shipping_addresses?.[0];
    if (!shippingAddress) {
      throw new Error("No shipping address found");
    }

    // Prepare Printful order payload
    const printfulOrder = {
      recipient: {
        name: shippingAddress.name,
        address1: shippingAddress.line1,
        address2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state_code: shippingAddress.state || "",
        country_code: shippingAddress.country,
        zip: shippingAddress.postal_code,
        phone: order.shipping_phone || "",
        email: order.user_email,
      },
      items: printfulItems,
      external_id: order.id,
    };

    console.log('📡 SENDING TO PRINTFUL:', JSON.stringify(printfulOrder, null, 2));

    // Make API call to Printful
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printfulOrder),
    });

    const result = await response.json();
    console.log('🖨️ PRINTFUL RESPONSE:', result);

    // Update order based on response
    if (response.ok && result.result) {
      await supabaseClient
        .from('orders')
        .update({
          printful_order_id: result.result.id.toString(),
          printful_status: 'created',
          printful_error: null,
          status: 'processing',
          retry_count: (order.retry_count || 0) + 1,
        })
        .eq('id', orderId);

      console.log('✅ PRINTFUL ORDER CREATED:', result.result.id);
      
      return new Response(JSON.stringify({
        success: true,
        printfulOrderId: result.result.id,
        message: 'Order successfully sent to Printful'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      const errorMsg = result.error?.message || 'Unknown Printful error';
      
      await supabaseClient
        .from('orders')
        .update({
          printful_error: errorMsg,
          printful_status: 'error',
          retry_count: (order.retry_count || 0) + 1,
        })
        .eq('id', orderId);

      throw new Error(errorMsg);
    }

  } catch (error) {
    console.error('❌ PRINTFUL FULFILLMENT ERROR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
