
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
    console.log('Received Printful webhook');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    console.log('Printful webhook data:', body);

    const { type, data } = body;

    switch (type) {
      case "order_updated": {
        const printfulOrderId = data.id;
        const status = data.status;
        
        console.log(`Order ${printfulOrderId} status updated to: ${status}`);

        // Update order status based on Printful status
        let orderStatus = 'processing';
        if (status === 'fulfilled') {
          orderStatus = 'shipped';
        } else if (status === 'canceled') {
          orderStatus = 'cancelled';
        }

        // Find and update the order in our database
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            status: orderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.external_id); // Using external_id to match our order ID

        if (error) {
          console.error('Error updating order status:', error);
        } else {
          console.log('Order status updated successfully');
        }
        break;
      }

      case "order_shipped": {
        const printfulOrderId = data.id;
        const trackingNumber = data.tracking_number;
        const trackingUrl = data.tracking_url;
        
        console.log(`Order ${printfulOrderId} shipped with tracking: ${trackingNumber}`);

        // Update order with shipping info
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            status: 'shipped',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.external_id);

        if (error) {
          console.error('Error updating shipped order:', error);
        } else {
          console.log('Order marked as shipped');
        }
        break;
      }

      default:
        console.log('Unhandled webhook type:', type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Printful webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
