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
  console.log("🔍 FULL SESSION DATA:", JSON.stringify(session, null, 2));

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

    // Extract shipping details with proper fallback handling
    let shippingAddress = null;
    let customerName = userEmail.split('@')[0];
    let customerPhone = null;

    // Try multiple sources for shipping info
    if (session.shipping?.address) {
      shippingAddress = session.shipping.address;
      customerName = session.shipping.name || customerName;
      console.log("✅ Using session.shipping for address");
    } else if (session.customer_details?.address) {
      shippingAddress = session.customer_details.address;
      customerName = session.customer_details.name || customerName;
      customerPhone = session.customer_details.phone;
      console.log("✅ Using session.customer_details for address");
    }

    console.log("🏠 SHIPPING INFO:", {
      hasShippingAddress: !!shippingAddress,
      customerName,
      customerPhone,
      shippingAddress
    });

    // Validate shipping address for physical products
    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city) {
      console.error("❌ Missing or incomplete shipping address");
      console.log("Available shipping data:", {
        sessionShipping: session.shipping,
        customerDetails: session.customer_details
      });
      throw new Error("Shipping address is required for physical products");
    }

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
        shipping_phone: customerPhone,
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

    // Store shipping address
    const { error: shippingError } = await supabaseClient.from("shipping_addresses").insert({
      order_id: order.id,
      name: customerName,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state || '',
      postal_code: shippingAddress.postal_code || '',
      country: shippingAddress.country || 'GB',
    });

    if (shippingError) {
      console.error("❌ SHIPPING ADDRESS ERROR:", shippingError);
      throw shippingError;
    }

    console.log("✅ SHIPPING ADDRESS STORED");

    // Send to Printful
    await sendToPrintful(order, items, shippingAddress, customerName, customerPhone, supabaseClient);

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

async function sendToPrintful(order: any, items: any[], shippingAddress: any, customerName: string, customerPhone: string | null, supabaseClient: any) {
  console.log("🖨️ SENDING ORDER TO PRINTFUL:", order.id);
  console.log("🔍 DETAILED PRINTFUL DEBUG - Order Items:", JSON.stringify(items, null, 2));

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
    // Validate shipping address again before sending to Printful
    if (!shippingAddress?.line1 || !shippingAddress?.city) {
      throw new Error("Shipping address is incomplete - missing line1 or city");
    }

    // Filter items that have Printful variant IDs and convert to proper numeric format
    const printfulItems = items.filter(item => {
      const variantId = item.printful_variant_id;
      console.log("🔍 DETAILED VARIANT ID CHECK:", { 
        productId: item.product_id, 
        originalVariantId: variantId,
        variantIdType: typeof variantId,
        variantIdLength: variantId?.length,
        isString: typeof variantId === 'string',
        startsWithHash: typeof variantId === 'string' && variantId.startsWith('#')
      });
      
      return variantId && variantId !== null && variantId !== "";
    }).map(item => {
      let variantId = item.printful_variant_id;
      const originalVariantId = variantId;
      
      console.log("🔄 PROCESSING VARIANT ID:", {
        original: originalVariantId,
        type: typeof variantId
      });
      
      // Handle different variant ID formats
      if (typeof variantId === 'string') {
        // Remove # prefix if present
        if (variantId.startsWith('#')) {
          variantId = variantId.substring(1);
          console.log("✂️ REMOVED # PREFIX:", variantId);
        }
        
        // Check if it's a hex string
        const isHex = /^[0-9a-fA-F]+$/.test(variantId);
        console.log("🔍 HEX CHECK:", { value: variantId, isHex });
        
        if (isHex) {
          const hexConverted = parseInt(variantId, 16);
          console.log("🔄 HEX CONVERSION:", { 
            hex: variantId, 
            decimal: hexConverted,
            success: !isNaN(hexConverted)
          });
          variantId = hexConverted;
        } else {
          // Try parsing as decimal
          const decimalConverted = parseInt(variantId, 10);
          console.log("🔄 DECIMAL CONVERSION:", { 
            string: variantId, 
            decimal: decimalConverted,
            success: !isNaN(decimalConverted)
          });
          if (!isNaN(decimalConverted)) {
            variantId = decimalConverted;
          }
        }
      }
      
      console.log("📦 FINAL VARIANT ID MAPPING:", {
        originalId: originalVariantId,
        processedId: variantId,
        finalType: typeof variantId,
        isNumeric: typeof variantId === 'number',
        quantity: item.quantity
      });
      
      return {
        variant_id: variantId,
        quantity: item.quantity,
      };
    });

    console.log("🔍 PRINTFUL ITEMS SUMMARY:", {
      totalItems: items.length,
      printfulItems: printfulItems.length,
      itemsWithVariantId: items.filter(item => item.printful_variant_id).length,
      processedItems: printfulItems.map(item => ({ 
        id: item.variant_id, 
        type: typeof item.variant_id,
        isNumber: typeof item.variant_id === 'number'
      }))
    });

    if (printfulItems.length === 0) {
      console.log("ℹ️ No valid Printful items to fulfill");
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "not_required",
          printful_error: "No items with valid Printful variant IDs found"
        })
        .eq("id", order.id);
      return;
    }

    // Check if all variant IDs are numeric
    const hasInvalidVariants = printfulItems.some(item => typeof item.variant_id !== 'number');
    if (hasInvalidVariants) {
      console.error("❌ Some variant IDs are not numeric:", printfulItems);
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "error",
          printful_error: "Invalid Printful variant IDs - must be numeric"
        })
        .eq("id", order.id);
      return;
    }

    // Prepare Printful order payload with validated shipping address
    const printfulOrder = {
      recipient: {
        name: customerName,
        address1: shippingAddress.line1,
        address2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state_code: shippingAddress.state || "",
        country_code: shippingAddress.country || "GB",
        zip: shippingAddress.postal_code || "",
        phone: customerPhone || "",
        email: order.user_email,
      },
      items: printfulItems,
      external_id: order.id,
    };

    console.log("📦 COMPLETE PRINTFUL PAYLOAD:", JSON.stringify(printfulOrder, null, 2));
    console.log("🌐 PRINTFUL API ENDPOINT:", "https://api.printful.com/orders");
    console.log("🔑 PRINTFUL API KEY EXISTS:", !!printfulApiKey);
    console.log("🔑 PRINTFUL API KEY PREFIX:", printfulApiKey?.substring(0, 10) + "...");

    // Make API call to Printful
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printfulOrder),
    });

    console.log("📡 PRINTFUL RESPONSE STATUS:", response.status);
    console.log("📡 PRINTFUL RESPONSE HEADERS:", JSON.stringify([...response.headers.entries()]));

    const result = await response.json();
    console.log("🖨️ COMPLETE PRINTFUL RESPONSE:", JSON.stringify(result, null, 2));

    if (response.ok && result.result) {
      // Success - update order with Printful ID
      await supabaseClient.from("orders")
        .update({ 
          printful_order_id: result.result.id.toString(),
          printful_status: "created",
          status: "processing",
          printful_error: null
        })
        .eq("id", order.id);
      
      console.log("✅ PRINTFUL ORDER CREATED SUCCESSFULLY:", result.result.id);
    } else {
      // Error - log and update status
      const errorMsg = result.error?.message || result.result || JSON.stringify(result) || "Unknown Printful error";
      console.error("❌ PRINTFUL API ERROR DETAILS:", {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        result: result.result,
        fullResponse: result
      });
      
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "error",
          printful_error: errorMsg
        })
        .eq("id", order.id);
    }
  } catch (error) {
    console.error("❌ PRINTFUL API EXCEPTION:", error);
    console.error("❌ EXCEPTION STACK:", error.stack);
    
    await supabaseClient.from("orders")
      .update({ 
        printful_status: "error",
        printful_error: error.message
      })
      .eq("id", order.id);
  }
}
