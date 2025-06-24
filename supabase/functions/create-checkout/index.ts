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
    console.log('Creating checkout session...');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log('User authenticated:', user.email);

    const { items } = await req.json();
    console.log('Processing items:', items);

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      console.log('No existing customer found, will create one in checkout');
    }

    // Calculate total
    const totalAmount = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    console.log('Total amount:', totalAmount);

    // Create Stripe checkout session with shipping address collection for all Printful supported countries
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: [
          // North America
          'US', 'CA', 'MX',
          // Europe
          'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'IE', 'PT', 'LU',
          'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'EE', 'LV', 'LT',
          'RO', 'BG', 'GR', 'CY', 'MT',
          // Asia-Pacific
          'AU', 'NZ', 'JP', 'SG', 'HK', 'MY', 'TH', 'KR',
          // Other regions
          'BR', 'IL', 'ZA', 'IN', 'PH', 'VN', 'ID', 'TW'
        ],
      },
      success_url: `${req.headers.get('origin')}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/shop`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        items: JSON.stringify(items),
      },
    });

    console.log('Stripe session created with shipping collection for all Printful countries:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
