
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
    const codeId = url.pathname.split('/').pop()

    if (!codeId) {
      return new Response('Code ID required', { status: 400, headers: corsHeaders })
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
      // Get user's claims for this code
      const { data, error } = await supabaseClient
        .from('user_qr_claims')
        .select('*, items(id, name)')
        .eq('code_id', codeId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching claims:', error)
        return new Response('Failed to fetch claims', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ claims: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { itemId } = await req.json()

      if (!itemId) {
        return new Response('Item ID required', { status: 400, headers: corsHeaders })
      }

      // Verify code exists and is active
      const { data: codeData, error: codeError } = await supabaseClient
        .from('global_qr_codes')
        .select('id, is_active')
        .eq('id', codeId)
        .single()

      if (codeError || !codeData || !codeData.is_active) {
        return new Response('Invalid or inactive QR code', { status: 404, headers: corsHeaders })
      }

      // Verify user owns the item
      const { data: itemData, error: itemError } = await supabaseClient
        .from('items')
        .select('id, user_id')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .single()

      if (itemError || !itemData) {
        return new Response('Item not found or access denied', { status: 404, headers: corsHeaders })
      }

      // Create claim
      const { data: claimData, error: claimError } = await supabaseClient
        .from('user_qr_claims')
        .insert({
          user_id: user.id,
          code_id: codeId,
          item_id: itemId
        })
        .select()
        .single()

      if (claimError) {
        if (claimError.code === '23505') { // Unique constraint violation
          return new Response('QR code already claimed for this item', { status: 409, headers: corsHeaders })
        }
        console.error('Error creating claim:', claimError)
        return new Response('Failed to claim QR code', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ claim: claimData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
