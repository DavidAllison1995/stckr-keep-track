import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-NATIVE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const body = await req.json();
    const { user_id, is_premium, platform, original_transaction_id, expires_date } = body;

    if (user.id !== user_id) {
      throw new Error("User ID mismatch");
    }

    logStep("Syncing native subscription", { user_id, is_premium, platform });

    // Update user_subscriptions table to reflect native subscription
    if (is_premium) {
      // Get Premium plan ID
      const { data: premiumPlan } = await supabaseClient
        .from('subscription_plans')
        .select('id')
        .eq('name', 'Premium')
        .single();

      if (premiumPlan) {
        // Upsert user subscription
        const { error: upsertError } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id,
            plan_id: premiumPlan.id,
            status: 'active',
            current_period_end: expires_date,
            subscription_source: platform === 'ios' ? 'apple' : 'google',
            native_transaction_id: original_transaction_id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          logStep("Error upserting subscription", upsertError);
          throw upsertError;
        }
      }
    } else {
      // Mark subscription as cancelled but keep record
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (updateError) {
        logStep("Error updating subscription status", updateError);
        throw updateError;
      }
    }

    logStep("Successfully synced native subscription");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
