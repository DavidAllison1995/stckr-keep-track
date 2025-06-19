
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

    // Check if code exists and is active
    const { data, error } = await supabaseClient
      .from('global_qr_codes')
      .select('id, is_active')
      .eq('id', codeId)
      .single()

    if (error || !data || !data.is_active) {
      return new Response(
        JSON.stringify({ codeId, exists: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ codeId, exists: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
