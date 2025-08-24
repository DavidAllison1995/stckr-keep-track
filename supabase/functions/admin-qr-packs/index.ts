import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create service role client for database operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Decode JWT payload to get user info (gateway verifies JWT)
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
      const payloadPart = token.split('.')[1];
      const payloadJson = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
      userId = payloadJson.sub || null;
      userEmail = payloadJson.email || null;
      console.log('JWT decoded. userId:', userId, 'email:', userEmail);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token payload' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing user id in token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using service client
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      console.log('Fetching packs from qr_pack_stats view...')
      // Get all packs with statistics
      const { data: packs, error } = await serviceClient
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
      let requestBody;
      try {
        const bodyText = await req.text();
        requestBody = bodyText ? JSON.parse(bodyText) : {};
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { name, description, physicalProductInfo, action } = requestBody;

      // Support listing via POST (supabase.functions.invoke uses POST by default)
      if (!name || action === 'list') {
        console.log('POST list packs - fetching from qr_pack_stats...')
        const { data: packs, error } = await serviceClient
          .from('qr_pack_stats')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching packs via POST:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch packs', details: error.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ packs: packs || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create new pack when name is provided
      const { data: pack, error } = await serviceClient
        .from('qr_code_packs')
        .insert({
          name,
          description,
          physical_product_info: physicalProductInfo,
          created_by: userId
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
      let requestBody;
      try {
        const bodyText = await req.text();
        requestBody = bodyText ? JSON.parse(bodyText) : {};
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { packId, name, description, physicalProductInfo } = requestBody;

      if (!packId) {
        return new Response('Pack ID is required', { status: 400, headers: corsHeaders })
      }

      // Update pack
      const { data: pack, error } = await serviceClient
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
      let requestBody;
      try {
        const bodyText = await req.text();
        requestBody = bodyText ? JSON.parse(bodyText) : {};
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { packId } = requestBody;

      if (!packId) {
        return new Response('Pack ID is required', { status: 400, headers: corsHeaders })
      }

      // Delete pack (this will set pack_id to null for associated QR codes)
      const { error } = await serviceClient
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