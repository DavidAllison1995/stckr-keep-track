
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    console.log('🛒 CREATE CHECKOUT: Starting request processing');
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { items, user_id, user_email } = await req.json();
    
    console.log('📋 CHECKOUT REQUEST:', {
      itemCount: items?.length,
      userId: user_id,
      userEmail: user_email
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ CHECKOUT ERROR: No items provided');
      throw new Error("No items provided for checkout");
    }

    if (!user_id || !user_email) {
      console.error('❌ CHECKOUT ERROR: Missing user information');
      throw new Error("User ID and email are required");
    }

    // Get product details from database
    const productIds = items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, price, printful_variant_id')
      .in('id', productIds);

    if (productsError) {
      console.error('❌ PRODUCTS FETCH ERROR:', productsError);
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      console.error('❌ CHECKOUT ERROR: No products found');
      throw new Error("No products found");
    }

    console.log('📦 PRODUCTS FOUND:', products.length);

    // Calculate total and prepare line items
    let totalAmount = 0;
    const lineItems = [];
    const metadataItems = [];

    for (const cartItem of items) {
      const product = products.find(p => p.id === cartItem.product_id);
      if (!product) {
        console.error('❌ PRODUCT NOT FOUND:', cartItem.product_id);
        continue;
      }

      const itemTotal = Math.round(product.price * cartItem.quantity * 100); // Convert to cents
      totalAmount += itemTotal;

      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: cartItem.quantity,
      });

      // Prepare metadata for Printful
      if (product.printful_variant_id) {
        metadataItems.push({
          product_id: product.id,
          variant_id: parseInt(product.printful_variant_id),
          quantity: cartItem.quantity,
          price: product.price,
          name: product.name,
        });
      } else {
        console.warn('⚠️ PRODUCT MISSING PRINTFUL ID:', product.name);
      }
    }

    console.log('💰 CHECKOUT TOTAL:', totalAmount / 100, 'GBP');
    console.log('🖨️ PRINTFUL ITEMS:', metadataItems.length);

    // Create Stripe checkout session with proper shipping collection
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/shop`,
      metadata: {
        user_id: user_id,
        user_email: user_email,
        items: JSON.stringify(metadataItems),
      },
      // IMPORTANT: Enable shipping address collection
      shipping_address_collection: {
        allowed_countries: [
          'GB', 'US', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 
          'AT', 'CH', 'IE', 'PT', 'LU', 'SE', 'NO', 'DK', 'FI', 'PL'
        ],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log('✅ STRIPE SESSION CREATED:', session.id);
    console.log('🏠 SHIPPING COLLECTION ENABLED:', !!session.shipping_address_collection);

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
