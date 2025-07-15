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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_user_admin', { user_id: user.id })

    if (adminError) {
      console.error('Admin check error:', adminError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      console.log('Fetching packs from qr_pack_stats view...')
      // Get all packs with statistics
      const { data: packs, error } = await supabaseClient
        .from('qr_pack_stats')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching packs:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch packs', details: error.message }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Successfully fetched packs:', packs)
      return new Response(
        JSON.stringify({ packs: packs || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { name, description, physicalProductInfo } = await req.json()

      if (!name) {
        return new Response('Pack name is required', { status: 400, headers: corsHeaders })
      }

      // Create new pack
      const { data: pack, error } = await supabaseClient
        .from('qr_code_packs')
        .insert({
          name,
          description,
          physical_product_info: physicalProductInfo,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating pack:', error)
        return new Response('Failed to create pack', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ pack }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const { packId, name, description, physicalProductInfo } = await req.json()

      if (!packId) {
        return new Response('Pack ID is required', { status: 400, headers: corsHeaders })
      }

      // Update pack
      const { data: pack, error } = await supabaseClient
        .from('qr_code_packs')
        .update({
          name,
          description,
          physical_product_info: physicalProductInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', packId)
        .select()
        .single()

      if (error) {
        console.error('Error updating pack:', error)
        return new Response('Failed to update pack', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ pack }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      const { packId } = await req.json()

      if (!packId) {
        return new Response('Pack ID is required', { status: 400, headers: corsHeaders })
      }

      // Delete pack (this will set pack_id to null for associated QR codes)
      const { error } = await supabaseClient
        .from('qr_code_packs')
        .delete()
        .eq('id', packId)

      if (error) {
        console.error('Error deleting pack:', error)
        return new Response('Failed to delete pack', { status: 500, headers: corsHeaders })
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Error in qr-packs function:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})