
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
      console.error("Missing signature or webhook secret");
      return new Response("Missing signature", { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Received webhook event:", event.type);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        // Update order status to paid
        const { data: updatedOrder, error } = await supabaseClient
          .from("orders")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_session_id", session.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating order status:", error);
          throw error;
        }

        console.log("Order status updated to paid:", updatedOrder.id);
        
        // Automatically trigger Printful fulfillment for paid order
        try {
          console.log("Triggering Printful fulfillment for order:", updatedOrder.id);
          
          const fulfillmentResponse = await supabaseClient.functions.invoke('printful-fulfillment', {
            body: { orderId: updatedOrder.id }
          });

          if (fulfillmentResponse.error) {
            console.error("Error triggering Printful fulfillment:", fulfillmentResponse.error);
            // Update order status to indicate fulfillment failed
            await supabaseClient
              .from("orders")
              .update({ 
                status: "paid", // Keep as paid since payment succeeded
                fulfillment_error: fulfillmentResponse.error.message,
                updated_at: new Date().toISOString()
              })
              .eq("id", updatedOrder.id);
          } else {
            console.log("Printful fulfillment triggered successfully:", fulfillmentResponse.data);
          }
        } catch (fulfillmentError) {
          console.error("Failed to trigger Printful fulfillment:", fulfillmentError);
          // Update order with error info but don't fail the webhook
          await supabaseClient
            .from("orders")
            .update({ 
              fulfillment_error: String(fulfillmentError),
              updated_at: new Date().toISOString()
            })
            .eq("id", updatedOrder.id);
        }

        // Clear user's cart after successful payment
        if (session.metadata?.user_id) {
          const { error: cartError } = await supabaseClient
            .from("cart_items")
            .delete()
            .eq("user_id", session.metadata.user_id);

          if (cartError) {
            console.error("Error clearing cart:", cartError);
          } else {
            console.log("Cart cleared for user:", session.metadata.user_id);
          }
        }
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment failed or expired:", session.id);

        // Update order status to failed
        const { error } = await supabaseClient
          .from("orders")
          .update({ 
            status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_session_id", session.id);

        if (error) {
          console.error("Error updating order status to failed:", error);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
