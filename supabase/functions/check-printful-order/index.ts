
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 CHECKING PRINTFUL ORDER STATUS');

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

    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get order from database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📋 ORDER INFO:', {
      id: order.id,
      printful_order_id: order.printful_order_id,
      printful_status: order.printful_status,
      status: order.status
    });

    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
    if (!printfulApiKey) {
      return new Response(JSON.stringify({ error: 'Printful API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let printfulOrderData = null;
    let printfulError = null;

    // Check if we have a Printful order ID to query
    if (order.printful_order_id) {
      console.log('🔍 CHECKING PRINTFUL ORDER:', order.printful_order_id);
      
      try {
        const response = await fetch(`https://api.printful.com/orders/${order.printful_order_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${printfulApiKey}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        console.log('📡 PRINTFUL ORDER RESPONSE:', JSON.stringify(result, null, 2));

        if (response.ok && result.result) {
          printfulOrderData = result.result;
        } else {
          printfulError = result.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        printfulError = `API Error: ${error.message}`;
      }
    }

    // Also check all orders from Printful to see if it exists with a different ID
    console.log('🔍 CHECKING ALL PRINTFUL ORDERS');
    
    let allPrintfulOrders = [];
    try {
      const allOrdersResponse = await fetch("https://api.printful.com/orders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${printfulApiKey}`,
          "Content-Type": "application/json",
        },
      });

      const allOrdersResult = await allOrdersResponse.json();
      console.log('📋 ALL PRINTFUL ORDERS:', JSON.stringify(allOrdersResult, null, 2));

      if (allOrdersResponse.ok && allOrdersResult.result) {
        allPrintfulOrders = allOrdersResult.result;
      }
    } catch (error) {
      console.error('❌ ERROR FETCHING ALL ORDERS:', error);
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        printful_order_id: order.printful_order_id,
        printful_status: order.printful_status,
        printful_error: order.printful_error,
        created_at: order.created_at,
        stripe_session_id: order.stripe_session_id
      },
      printful_order_data: printfulOrderData,
      printful_error: printfulError,
      all_printful_orders: allPrintfulOrders.map(po => ({
        id: po.id,
        external_id: po.external_id,
        status: po.status,
        created: po.created,
        recipient: po.recipient?.name
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ CHECK ORDER ERROR:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
