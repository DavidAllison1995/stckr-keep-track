
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

    // Extract shipping details from Stripe session
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
      address: shippingAddress
    });

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city) {
      console.error("❌ Missing or incomplete shipping address");
      throw new Error("Shipping address is required for order fulfillment");
    }

    // Get fresh product data from database
    console.log("🔍 FETCHING PRODUCT DATA FROM DATABASE...");
    const productIds = items.map((item: any) => item.product_id);
    
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      console.error("❌ ERROR FETCHING PRODUCTS:", productsError);
      throw productsError;
    }

    console.log("📦 PRODUCT DATA:", products?.map(p => ({
      id: p.id,
      name: p.name,
      printful_variant_id: p.printful_variant_id,
      updated_at: p.updated_at
    })));

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

    // Send to Printful with validated sync variants
    await sendToPrintful(order, products, items, shippingAddress, customerName, customerPhone, supabaseClient);

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

async function sendToPrintful(order: any, products: any[], items: any[], shippingAddress: any, customerName: string, customerPhone: string | null, supabaseClient: any) {
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
    // First, validate sync variants exist in Printful store
    console.log("🔍 VALIDATING SYNC VARIANTS...");
    const validSyncVariants = await getValidSyncVariants(printfulApiKey);
    
    console.log("📋 AVAILABLE SYNC VARIANTS:", validSyncVariants.slice(0, 5).map(v => ({
      id: v.id,
      name: v.name,
      product: v.product?.name
    })));

    // Match products with valid sync variants
    const validPrintfulItems = [];
    
    for (const product of products) {
      const syncVariantId = product.printful_variant_id;
      const orderItem = items.find((item: any) => item.product_id === product.id);
      
      if (!syncVariantId) {
        console.warn(`⚠️ Product ${product.name} has no printful_variant_id`);
        continue;
      }

      // Find matching sync variant
      const syncVariant = validSyncVariants.find(v => v.id === parseInt(syncVariantId));
      
      if (!syncVariant) {
        console.error(`❌ SYNC VARIANT NOT FOUND: ${syncVariantId} for product ${product.name}`);
        console.log(`💡 Available sync variant IDs: ${validSyncVariants.slice(0, 10).map(v => v.id).join(', ')}`);
        
        await supabaseClient.from("orders")
          .update({ 
            printful_status: "error",
            printful_error: `Invalid sync variant ID: ${syncVariantId}. Check your Printful dashboard for correct sync variant IDs.`
          })
          .eq("id", order.id);
        return;
      }

      console.log(`✅ VALID SYNC VARIANT FOUND: ${syncVariantId} - ${syncVariant.name}`);
      
      validPrintfulItems.push({
        sync_variant_id: parseInt(syncVariantId),
        quantity: orderItem?.quantity || 1,
      });
    }

    if (validPrintfulItems.length === 0) {
      console.log("ℹ️ No valid sync variants to fulfill");
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "not_required",
          printful_error: "No items with valid sync variant IDs found"
        })
        .eq("id", order.id);
      return;
    }

    // Prepare Printful order payload
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
      items: validPrintfulItems,
      external_id: order.id,
    };

    console.log("📦 PRINTFUL ORDER PAYLOAD:", JSON.stringify(printfulOrder, null, 2));

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

    const result = await response.json();
    console.log("🖨️ PRINTFUL RESPONSE:", JSON.stringify(result, null, 2));

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
      const errorMsg = result.error?.message || result.result || `HTTP ${response.status}: ${response.statusText}` || "Unknown Printful error";
      
      console.error("❌ PRINTFUL API ERROR:", {
        status: response.status,
        error: result.error,
        result: result.result,
        code: result.code
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
    
    await supabaseClient.from("orders")
      .update({ 
        printful_status: "error",
        printful_error: `Exception: ${error.message}`
      })
      .eq("id", order.id);
  }
}

async function getValidSyncVariants(printfulApiKey: string) {
  console.log("🔍 FETCHING VALID SYNC VARIANTS FROM PRINTFUL...");
  
  try {
    const response = await fetch("https://api.printful.com/sync/products", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch sync products:", response.status, response.statusText);
      return [];
    }

    const result = await response.json();
    console.log(`📦 FETCHED ${result.result?.length || 0} SYNC PRODUCTS`);

    // Extract all sync variants from all products
    const syncVariants = [];
    for (const product of result.result || []) {
      if (product.sync_variants) {
        for (const variant of product.sync_variants) {
          syncVariants.push({
            id: variant.id,
            name: variant.name,
            product: product,
            sync_product_id: product.id
          });
        }
      }
    }

    console.log(`✅ FOUND ${syncVariants.length} TOTAL SYNC VARIANTS`);
    return syncVariants;

  } catch (error) {
    console.error("❌ ERROR FETCHING SYNC VARIANTS:", error);
    return [];
  }
}
