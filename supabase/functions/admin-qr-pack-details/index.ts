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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_user_admin', { user_id: user.id })

    if (adminError || !isAdmin) {
      return new Response('Forbidden - Admin access required', { status: 403, headers: corsHeaders })
    }

    const url = new URL(req.url)
    const packId = url.pathname.split('/').pop()

    if (!packId) {
      return new Response('Pack ID required', { status: 400, headers: corsHeaders })
    }

    // Get QR codes for the specified pack
    const { data: qrCodes, error } = await supabaseClient
      .from('qr_codes')
      .select(`
        *,
        pack:qr_code_packs(
          id,
          name,
          description,
          physical_product_info
        )
      `)
      .eq('pack_id', packId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching QR codes for pack:', error)
      return new Response('Failed to fetch QR codes', { status: 500, headers: corsHeaders })
    }

    // Get pack details
    const { data: pack, error: packError } = await supabaseClient
      .from('qr_code_packs')
      .select('*')
      .eq('id', packId)
      .single()

    if (packError) {
      console.error('Error fetching pack details:', packError)
      return new Response('Failed to fetch pack details', { status: 500, headers: corsHeaders })
    }

    return new Response(
      JSON.stringify({ pack, qrCodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in qr-pack-details function:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})