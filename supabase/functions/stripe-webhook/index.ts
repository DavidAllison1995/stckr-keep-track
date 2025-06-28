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
    console.log("✅ STRIPE WEBHOOK: Received request");
    console.log("🔑 WEBHOOK SECRET EXISTS:", !!endpointSecret);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    console.log("📝 SIGNATURE EXISTS:", !!signature);
    console.log("📏 BODY LENGTH:", body.length);

    if (!signature) {
      console.error("❌ STRIPE WEBHOOK: Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    if (!endpointSecret) {
      console.error("❌ STRIPE WEBHOOK: Missing webhook secret in environment");
      return new Response("Missing webhook secret", { status: 500 });
    }

    let event;
    try {
      console.log("🔍 VERIFYING STRIPE SIGNATURE...");
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log("✅ SIGNATURE VERIFIED SUCCESSFULLY");
    } catch (err) {
      console.error("❌ STRIPE WEBHOOK: Signature verification failed:", err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log("✅ STRIPE WEBHOOK: Received event:", event.type, "ID:", event.id);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 PAYMENT SUCCESS: Processing session:", session.id);

        try {
          // Parse items from session metadata
          const items = JSON.parse(session.metadata?.items || '[]');
          const userId = session.metadata?.user_id;
          const userEmail = session.metadata?.user_email;

          console.log("📋 ORDER DATA:", {
            sessionId: session.id,
            userId,
            userEmail,
            itemsCount: items.length,
            amountTotal: session.amount_total,
            paymentStatus: session.payment_status
          });

          if (!userId || !userEmail || !items.length) {
            const error = "Missing required session metadata";
            console.error("❌ VALIDATION ERROR:", error, {
              userId: !!userId,
              userEmail: !!userEmail,
              itemsLength: items.length
            });
            throw new Error(error);
          }

          // Only proceed if payment was successful
          if (session.payment_status !== 'paid') {
            console.warn("⚠️ PAYMENT NOT CONFIRMED:", session.payment_status);
            return new Response(JSON.stringify({ received: true, warning: 'Payment not confirmed' }), {
              headers: { "Content-Type": "application/json" },
              status: 200,
            });
          }

          console.log("💳 PAYMENT CONFIRMED - Creating order...");
          console.log("📦 PROCESSING ITEMS:", items);
          console.log("🏠 SHIPPING DETAILS:", session.shipping_details);

          // Calculate total amount
          const totalAmount = items.reduce((total: number, item: any) => {
            return total + (item.price * item.quantity);
          }, 0);

          console.log("💵 CALCULATED TOTAL:", totalAmount);

          // Create the order record with "paid" status immediately
          console.log("🗃️ CREATING ORDER in database...");
          const { data: order, error: orderError } = await supabaseClient
            .from("orders")
            .insert({
              user_id: userId,
              user_email: userEmail,
              status: "paid", // Set as paid immediately since Stripe confirmed payment
              total_amount: totalAmount,
              stripe_session_id: session.id,
            })
            .select()
            .single();

          if (orderError) {
            console.error("❌ ORDER CREATION ERROR:", orderError);
            throw orderError;
          }

          console.log("✅ ORDER CREATED:", order.id, "Status:", order.status);

          // Store shipping address if provided
          if (session.shipping_details?.address) {
            console.log("🏠 STORING SHIPPING ADDRESS...");
            const address = session.shipping_details.address;
            const { error: addressError } = await supabaseClient
              .from("shipping_addresses")
              .insert({
                order_id: order.id,
                name: session.shipping_details.name || userEmail.split('@')[0],
                line1: address.line1 || '',
                line2: address.line2,
                city: address.city || '',
                state: address.state,
                postal_code: address.postal_code || '',
                country: address.country || '',
              });

            if (addressError) {
              console.error("❌ SHIPPING ADDRESS ERROR:", addressError);
            } else {
              console.log("✅ SHIPPING ADDRESS STORED");
            }
          } else {
            console.warn("⚠️ NO SHIPPING ADDRESS provided in session");
          }

          // Create order items
          console.log("📋 CREATING ORDER ITEMS...");
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
            console.error("❌ ORDER ITEMS ERROR:", itemsError);
            // Delete the order if items creation fails
            await supabaseClient.from("orders").delete().eq("id", order.id);
            throw itemsError;
          }

          console.log("✅ ORDER ITEMS CREATED:", orderItems.length, "items");

          // IMMEDIATE PRINTFUL FULFILLMENT ATTEMPT
          console.log("🖨️ TRIGGERING PRINTFUL FULFILLMENT for order:", order.id);
          
          try {
            const fulfillmentResponse = await supabaseClient.functions.invoke('printful-fulfillment', {
              body: { orderId: order.id }
            });

            console.log("🖨️ PRINTFUL RESPONSE:", {
              error: fulfillmentResponse.error,
              data: fulfillmentResponse.data,
              status: fulfillmentResponse.status
            });

            if (fulfillmentResponse.error) {
              console.error("❌ PRINTFUL FULFILLMENT FAILED:", fulfillmentResponse.error);
              
              // Update order with fulfillment error but keep it as paid
              await supabaseClient
                .from("orders")
                .update({ 
                  fulfillment_error: fulfillmentResponse.error.message || 'Printful fulfillment failed',
                  updated_at: new Date().toISOString()
                })
                .eq("id", order.id);
                
              console.log("⚠️ ORDER MARKED with fulfillment error but kept as paid for manual review");
            } else {
              console.log("✅ PRINTFUL FULFILLMENT SUCCESSFUL:", fulfillmentResponse.data);
              
              // Update order with successful Printful order ID if provided
              if (fulfillmentResponse.data?.printfulOrderId) {
                await supabaseClient
                  .from("orders")
                  .update({ 
                    printful_order_id: fulfillmentResponse.data.printfulOrderId,
                    status: 'processing',
                    updated_at: new Date().toISOString()
                  })
                  .eq("id", order.id);
                  
                console.log("✅ ORDER UPDATED with Printful ID:", fulfillmentResponse.data.printfulOrderId);
              }
            }
          } catch (printfulError) {
            console.error("❌ PRINTFUL FULFILLMENT EXCEPTION:", printfulError);
            
            // Update order with exception error
            await supabaseClient
              .from("orders")
              .update({ 
                fulfillment_error: `Printful API error: ${printfulError.message}`,
                updated_at: new Date().toISOString()
              })
              .eq("id", order.id);
          }

          // Clear user's cart after successful order creation
          console.log("🛒 CLEARING USER CART...");
          const { error: cartError } = await supabaseClient
            .from("cart_items")
            .delete()
            .eq("user_id", userId);

          if (cartError) {
            console.error("❌ CART CLEAR ERROR:", cartError);
          } else {
            console.log("✅ CART CLEARED for user:", userId);
          }

          console.log("🎉 STRIPE WEBHOOK PROCESSING COMPLETE for session:", session.id);

        } catch (error) {
          console.error("❌ STRIPE WEBHOOK PROCESSING FAILED:", error);
          console.error("🔍 ERROR DETAILS:", {
            message: error.message,
            stack: error.stack,
            sessionId: session.id
          });
          // Note: We don't throw here to avoid webhook retry loops
        }
        
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("❌ PAYMENT FAILED/EXPIRED:", session.id);
        break;
      }

      default:
        console.log("ℹ️ UNHANDLED STRIPE EVENT:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ STRIPE WEBHOOK ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
