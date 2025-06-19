
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.pathname.split('/').pop()

    if (!code) {
      return new Response('Code required', { status: 400, headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    if (req.method === 'GET') {
      // Get user's claim for this code
      const { data, error } = await supabaseClient
        .from('user_qr_claims')
        .select(`
          *,
          qr_codes!inner (
            code
          ),
          items (
            id,
            name
          )
        `)
        .eq('qr_codes.code', code)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching claim:', error)
        return new Response('Failed to fetch claim', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ claim: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { itemId } = await req.json()

      if (!itemId) {
        return new Response('Item ID required', { status: 400, headers: corsHeaders })
      }

      // Use the RPC function to claim the code
      const { data, error } = await supabaseClient.rpc('claim_qr', {
        p_code: code,
        p_user_id: user.id,
        p_item_id: itemId
      })

      if (error) {
        console.error('Error claiming code:', error)
        return new Response('Failed to claim code', { status: 500, headers: corsHeaders })
      }

      const result = data as { success: boolean; error?: string; message?: string }

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: result.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
