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

        try {
          // Parse items from session metadata
          const items = JSON.parse(session.metadata?.items || '[]');
          const userId = session.metadata?.user_id;
          const userEmail = session.metadata?.user_email;

          if (!userId || !userEmail || !items.length) {
            throw new Error("Missing required session metadata");
          }

          console.log("Processing payment for user:", userEmail, "with items:", items);

          // Calculate total amount
          const totalAmount = items.reduce((total: number, item: any) => {
            return total + (item.price * item.quantity);
          }, 0);

          // First, create the order record
          const { data: order, error: orderError } = await supabaseClient
            .from("orders")
            .insert({
              user_id: userId,
              user_email: userEmail,
              status: "paid",
              total_amount: totalAmount,
              stripe_session_id: session.id,
            })
            .select()
            .single();

          if (orderError) {
            console.error("Error creating order:", orderError);
            throw orderError;
          }

          console.log("Order created:", order.id);

          // Create order items
          const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          }));

          const { error: itemsError } = await supabaseClient
            .from("order_items")
            .insert(orderItems);

          if (itemsError) {
            console.error("Error creating order items:", itemsError);
            // Delete the order if items creation fails
            await supabaseClient.from("orders").delete().eq("id", order.id);
            throw itemsError;
          }

          console.log("Order items created successfully");

          // Now attempt Printful fulfillment
          console.log("Triggering Printful fulfillment for order:", order.id);
          
          const fulfillmentResponse = await supabaseClient.functions.invoke('printful-fulfillment', {
            body: { orderId: order.id }
          });

          if (fulfillmentResponse.error) {
            console.error("Printful fulfillment failed:", fulfillmentResponse.error);
            
            // Update order with fulfillment error but keep it as paid
            await supabaseClient
              .from("orders")
              .update({ 
                fulfillment_error: fulfillmentResponse.error.message,
                updated_at: new Date().toISOString()
              })
              .eq("id", order.id);
              
            console.log("Order marked with fulfillment error but kept as paid for manual review");
          } else {
            console.log("Printful fulfillment successful:", fulfillmentResponse.data);
          }

          // Clear user's cart after successful order creation
          const { error: cartError } = await supabaseClient
            .from("cart_items")
            .delete()
            .eq("user_id", userId);

          if (cartError) {
            console.error("Error clearing cart:", cartError);
          } else {
            console.log("Cart cleared for user:", userId);
          }

        } catch (error) {
          console.error("Failed to process completed checkout:", error);
          // Note: We don't throw here to avoid webhook retry loops
          // The order creation failure is logged but webhook returns success
        }
        
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment failed or expired:", session.id);
        // No order to update since we don't create orders until payment succeeds
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
