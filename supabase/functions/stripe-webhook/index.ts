
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
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a subscription or one-time payment
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session, supabaseClient);
        } else {
          await handleCheckoutCompleted(session, supabaseClient);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      }
      case "invoice.payment_succeeded": {
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
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

    // Send to Printful using sync variant IDs
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
    // Build items array using sync variant IDs
    const printfulItems = [];
    
    for (const product of products) {
      const syncVariantId = product.printful_variant_id;
      const orderItem = items.find((item: any) => item.product_id === product.id);
      
      if (!syncVariantId) {
        console.error(`❌ Product ${product.name} has no printful_variant_id (sync variant ID)`);
        
        await supabaseClient.from("orders")
          .update({ 
            printful_status: "error",
            printful_error: `Missing sync variant ID for product: ${product.name}. Please configure printful_variant_id in the database.`
          })
          .eq("id", order.id);
        return;
      }

      // Convert to integer if it's a string
      const parsedSyncVariantId = parseInt(syncVariantId);
      if (isNaN(parsedSyncVariantId)) {
        console.error(`❌ INVALID SYNC VARIANT ID: ${syncVariantId} for product ${product.name}`);
        
        await supabaseClient.from("orders")
          .update({ 
            printful_status: "error",
            printful_error: `Invalid sync variant ID: ${syncVariantId} for product ${product.name}. Must be a valid numeric sync variant ID.`
          })
          .eq("id", order.id);
        return;
      }

      console.log(`✅ USING SYNC VARIANT ID: ${parsedSyncVariantId} for ${product.name}`);
      
      printfulItems.push({
        sync_variant_id: parsedSyncVariantId,
        quantity: orderItem?.quantity || 1,
      });
    }

    if (printfulItems.length === 0) {
      console.log("ℹ️ No valid sync variants to fulfill");
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "not_required",
          printful_error: "No items with valid sync variant IDs found"
        })
        .eq("id", order.id);
      return;
    }

    // Create Printful-compatible external ID using timestamp and order prefix
    const timestamp = Date.now();
    const shortOrderId = order.id.substring(0, 8);
    const printfulExternalId = `order-${timestamp}-${shortOrderId}`;
    
    console.log("🏷️ USING PRINTFUL EXTERNAL ID:", printfulExternalId);

    // Prepare Printful order payload using sync variant IDs
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
      shipping: "STANDARD",
      external_id: printfulExternalId,
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
          printful_status: "sent",
          status: "processing",
          printful_error: null
        })
        .eq("id", order.id);
      
      console.log("✅ PRINTFUL ORDER CREATED SUCCESSFULLY:", result.result.id);
    } else {
      // Error - log detailed information and update status
      const errorMsg = result.error?.message || result.result || `HTTP ${response.status}: ${response.statusText}` || "Unknown Printful error";
      
      console.error("❌ PRINTFUL API ERROR:", {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        result: result.result,
        code: result.code,
        requestPayload: printfulOrder,
        fullResponse: result
      });
      
      await supabaseClient.from("orders")
        .update({ 
          printful_status: "error",
          printful_error: `${errorMsg} | Request: ${JSON.stringify(printfulOrder)} | Response: ${JSON.stringify(result)}`
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

// Handle subscription checkout completion
async function handleSubscriptionCheckout(session: Stripe.Checkout.Session, supabaseClient: any) {
  console.log("💎 PROCESSING SUBSCRIPTION CHECKOUT:", session.id);

  try {
    if (session.payment_status !== 'paid') {
      console.warn("⚠️ Subscription payment not confirmed, skipping");
      return;
    }

    // Get customer email from session
    const customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      throw new Error("No customer email found in session");
    }

    console.log("📧 Customer email:", customerEmail);

    // Find user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) {
      console.error("❌ Error fetching users:", userError);
      throw userError;
    }

    const user = userData.users.find((u: any) => u.email === customerEmail);
    if (!user) {
      console.error("❌ User not found for email:", customerEmail);
      throw new Error(`User not found for email: ${customerEmail}`);
    }

    console.log("👤 Found user:", user.id);

    // Get subscription details from Stripe
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await updateUserSubscription(subscription, user.id, supabaseClient);
    }

    console.log("✅ Subscription checkout processed successfully");

  } catch (error) {
    console.error("❌ SUBSCRIPTION CHECKOUT ERROR:", error);
    throw error;
  }
}

// Handle subscription created/updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log("🔄 PROCESSING SUBSCRIPTION UPDATE:", subscription.id);

  try {
    // Get customer email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found or deleted");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find((u: any) => u.email === customerEmail);
    if (!user) {
      console.error("❌ User not found for email:", customerEmail);
      return;
    }

    await updateUserSubscription(subscription, user.id, supabaseClient);
    console.log("✅ Subscription updated successfully");

  } catch (error) {
    console.error("❌ SUBSCRIPTION UPDATE ERROR:", error);
    throw error;
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log("❌ PROCESSING SUBSCRIPTION CANCELLATION:", subscription.id);

  try {
    // Get customer email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found or deleted");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find((u: any) => u.email === customerEmail);
    if (!user) {
      console.error("❌ User not found for email:", customerEmail);
      return;
    }

    // Get free plan
    const { data: freePlan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Free')
      .single();

    if (planError) throw planError;

    // Update user subscription to free
    await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: freePlan.id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: null,
        status: 'cancelled',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log("✅ Subscription cancelled, user moved to free plan");

  } catch (error) {
    console.error("❌ SUBSCRIPTION CANCELLATION ERROR:", error);
    throw error;
  }
}

// Handle successful payment (for recurring billing)
async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log("💰 PROCESSING PAYMENT SUCCESS:", invoice.id);

  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      
      // Get customer email
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found or deleted");
      }

      const customerEmail = (customer as Stripe.Customer).email;
      if (!customerEmail) {
        throw new Error("Customer email not found");
      }

      // Find user by email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
      if (userError) throw userError;

      const user = userData.users.find((u: any) => u.email === customerEmail);
      if (!user) {
        console.error("❌ User not found for email:", customerEmail);
        return;
      }

      await updateUserSubscription(subscription, user.id, supabaseClient);
      console.log("✅ Payment processed, subscription updated");
    }

  } catch (error) {
    console.error("❌ PAYMENT SUCCESS ERROR:", error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log("❌ PROCESSING PAYMENT FAILURE:", invoice.id);

  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      
      // Get customer email
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found or deleted");
      }

      const customerEmail = (customer as Stripe.Customer).email;
      if (!customerEmail) {
        throw new Error("Customer email not found");
      }

      // Find user by email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
      if (userError) throw userError;

      const user = userData.users.find((u: any) => u.email === customerEmail);
      if (!user) {
        console.error("❌ User not found for email:", customerEmail);
        return;
      }

      // Update subscription status to past_due
      await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      console.log("⚠️ Payment failed, subscription marked as past_due");
    }

  } catch (error) {
    console.error("❌ PAYMENT FAILURE ERROR:", error);
    throw error;
  }
}

// Helper function to update user subscription
async function updateUserSubscription(subscription: Stripe.Subscription, userId: string, supabaseClient: any) {
  console.log("🔄 UPDATING USER SUBSCRIPTION:", subscription.id, "for user:", userId);

  try {
    // Get premium plan
    const { data: premiumPlan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Premium')
      .single();

    if (planError) throw planError;

    // Update user subscription
    await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: premiumPlan.id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log("✅ User subscription updated successfully");

  } catch (error) {
    console.error("❌ UPDATE SUBSCRIPTION ERROR:", error);
    throw error;
  }
}
