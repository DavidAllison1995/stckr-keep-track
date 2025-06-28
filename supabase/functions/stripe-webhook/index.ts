
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("🎣 STRIPE WEBHOOK: Processing incoming request");

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    if (!endpointSecret) {
      console.error("❌ Missing webhook secret");
      return new Response("Missing webhook secret", { status: 500 });
    }

    let event;
    try {
      // Use async method for edge environments
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
      console.log("✅ Webhook signature verified for event:", event.type);
    } catch (err) {
      console.error("❌ Signature verification failed:", err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Log webhook event
    await supabaseClient.from("webhook_logs").insert({
      webhook_type: event.type,
      event_data: event,
      stripe_session_id: event.data.object?.id,
    });

    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient);
        break;
      }
      default:
        console.log("ℹ️ Unhandled webhook event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ STRIPE WEBHOOK ERROR:", error);
    
    // Update webhook log with error
    await supabaseClient.from("webhook_logs").insert({
      webhook_type: "error",
      error_message: error.message,
      processing_status: "failed",
    });

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabaseClient: any) {
  console.log("💰 PROCESSING SUCCESSFUL PAYMENT:", session.id);

  try {
    // Parse session metadata
    const items = JSON.parse(session.metadata?.items || '[]');
    const userId = session.metadata?.user_id;
    const userEmail = session.metadata?.user_email;
    const totalAmount = parseFloat(session.metadata?.total_amount || '0');

    console.log("📋 ORDER DETAILS:", {
      sessionId: session.id,
      userId,
      userEmail,
      itemsCount: items.length,
      totalAmount,
      paymentStatus: session.payment_status
    });

    if (!userId || !userEmail || !items.length) {
      throw new Error("Missing required session metadata");
    }

    if (session.payment_status !== 'paid') {
      console.warn("⚠️ Payment not confirmed, skipping order creation");
      return;
    }

    // Extract shipping details
    const shippingDetails = session.shipping_details;
    const customerName = shippingDetails?.name || session.customer_details?.name || userEmail.split('@')[0];
    const shippingPhone = session.customer_details?.phone;

    console.log("🏠 SHIPPING INFO:", {
      name: customerName,
      phone: shippingPhone,
      address: shippingDetails?.address
    });

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: userId,
        user_email: userEmail,
        status: "paid",
        total_amount: totalAmount,
        stripe_session_id: session.id,
        customer_name: customerName,
        shipping_phone: shippingPhone,
        printful_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ ORDER CREATION ERROR:", orderError);
      throw orderError;
    }

    console.log("✅ ORDER CREATED:", order.id);

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
      console.error("❌ ORDER ITEMS ERROR:", itemsError);
      throw itemsError;
    }

    console.log("✅ ORDER ITEMS CREATED");

    // Store shipping address if provided
    if (shippingDetails?.address) {
      await supabaseClient.from("shipping_addresses").insert({
        order_id: order.id,
        name: customerName,
        line1: shippingDetails.address.line1 || '',
        line2: shippingDetails.address.line2,
        city: shippingDetails.address.city || '',
        state: shippingDetails.address.state,
        postal_code: shippingDetails.address.postal_code || '',
        country: shippingDetails.address.country || '',
      });
      console.log("✅ SHIPPING ADDRESS STORED");
    }

    // Send to Printful
    await sendToPrintful(order, items, shippingDetails, customerName, shippingPhone, supabaseClient);

    // Clear user cart
    await supabaseClient.from("cart_items").delete().eq("user_id", userId);
    console.log("🛒 CART CLEARED");

    // Update webhook log
    await supabaseClient.from("webhook_logs")
      .update({ processing_status: "completed" })
      .eq("stripe_session_id", session.id);

  } catch (error) {
    console.error("❌ CHECKOUT PROCESSING ERROR:", error);
    
    // Update webhook log with error
    await supabaseClient.from("webhook_logs")
      .update({ 
        processing_status: "failed",
        error_message: error.message 
      })
      .eq("stripe_session_id", session.id);
      
    throw error;
  }
}

async function sendToPrintful(order: any, items: any[], shippingDetails: any, customerName: string, shippingPhone: string | null, supabaseClient: any) {
  console.log("🖨️ SENDING ORDER TO PRINTFUL:", order.id);

  const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY");
  if (!printfulApiKey) {
    console.error("❌ PRINTFUL API KEY NOT FOUND");
    await supabaseClient.from("orders")
      .update({ 
        printful_status: "error",
        printful_error: "Printful API key not configured"
      })
      .eq("id", order.id);
    return;
  }

  try {
    // Filter items that have Printful variant IDs
    const printfulItems = items.filter(item => item.printful_variant_id).map(item => ({
      variant_id: parseInt(item.printful_variant_id),
      quantity: item.quantity,
    }));

    if (printfulItems.length === 0) {
      console.log("ℹ️ No Printful items to fulfill");
      await supabaseClient.from("orders")
        .update({ printful_status: "not_required" })
        .eq("id", order.id);
      return;
    }

    // Prepare Printful order payload
    const printfulOrder = {
      recipient: {
        name: customerName,
        address1: shippingDetails?.address?.line1 || "",
        address2: shippingDetails?.address?.line2 || "",
        city: shippingDetails?.address?.city || "",
        state_code: shippingDetails?.address?.state || "",
        country_code: shippingDetails?.address?.country || "GB",
        zip: shippingDetails?.address?.postal_code || "",
        phone: shippingPhone || "",
        email: order.user_email,
      },
      items: printfulItems,
      external_id: order.id, // Link back to our order
    };

    console.log("📦 PRINTFUL PAYLOAD:", JSON.stringify(printfulOrder, null, 2));

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
    console.log("🖨️ PRINTFUL RESPONSE:", result);

    if (response.ok && result.result) {
      // Success - update order with Printful ID
      await supabaseClient.from("orders")
        .update({ 
          printful_order_id: result.result.id.toString(),
          printful_status: "created",
          status: "processing"
        })
        .eq("id", order.id);
      
      console.log("✅ PRINTFUL ORDER CREATED:", result.result.id);
    } else {
      // Error - log and update status
      const errorMsg = result.error?.message || "Unknown Printful error";
      console.error("❌ PRINTFUL ERROR:", errorMsg);
      
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "error",
          printful_error: errorMsg
        })
        .eq("id", order.id);
    }
  } catch (error) {
    console.error("❌ PRINTFUL API ERROR:", error);
    
    await supabaseClient.from("orders")
      .update({ 
        printful_status: "error",
        printful_error: error.message
      })
      .eq("id", order.id);
  }
}
