
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🛒 CREATE CHECKOUT: Starting request processing");
    
    const { items, user_id, user_email } = await req.json();
    
    console.log("📋 CHECKOUT REQUEST:", {
      itemCount: items?.length || 0,
      userId: user_id,
      userEmail: user_email
    });

    if (!items || !items.length) {
      throw new Error("No items provided");
    }

    if (!user_id || !user_email) {
      throw new Error("User ID and email are required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get product details from database
    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log("📦 PRODUCTS FOUND:", products?.length || 0);

    // Create line items for Stripe with proper metadata
    const lineItems = items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            description: product.description || "",
            images: product.image_url ? [product.image_url] : [],
            metadata: {
              product_id: product.id,
              printful_variant_id: product.printful_variant_id || "",
            },
          },
          unit_amount: Math.round(product.price * 100), // Convert to pence
        },
        quantity: item.quantity,
      };
    });

    const totalAmount = items.reduce((total: number, item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);

    console.log("💰 CHECKOUT TOTAL:", totalAmount, "GBP");

    // Create detailed metadata for webhook processing
    const orderMetadata = {
      user_id,
      user_email,
      items: JSON.stringify(items.map((item: any) => {
        const product = products?.find(p => p.id === item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: product?.price || 0,
          name: product?.name || "Product",
          printful_variant_id: product?.printful_variant_id,
        };
      })),
      total_amount: totalAmount.toString(),
    };

    console.log("🖨️ PRINTFUL ITEMS:", items.filter((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return product?.printful_variant_id;
    }).length);

    // Enable shipping collection for physical products
    const shippingEnabled = true;
    console.log("🏠 SHIPPING COLLECTION ENABLED:", shippingEnabled);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/shop`,
      customer_email: user_email,
      metadata: orderMetadata,
      shipping_address_collection: shippingEnabled ? {
        allowed_countries: ["GB", "US", "CA", "AU", "DE", "FR", "ES", "IT", "NL", "BE"],
      } : undefined,
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log("✅ STRIPE SESSION CREATED:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ CREATE CHECKOUT ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
