
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
    console.log('=== Admin QR List Function Started ===')
    
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)
    
    // Create service role client for database operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log('Service client created')
    
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
      console.error('Failed to decode JWT:', e);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token payload' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing user id in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', userEmail, 'ID:', userId)
    
    // Check if user is admin using service client
    console.log('Checking admin status for user:', userId)
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    console.log('Profile query result:', { profile, error: profileError })

    if (profileError) {
      console.error('Profile lookup failed:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status', details: profileError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile?.is_admin) {
      console.error('Admin check failed - is_admin:', profile?.is_admin)
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin access confirmed for user:', userEmail)

    // Get all QR codes with pack information using service role client to bypass RLS
    console.log('Fetching QR codes from qr_codes table...')
    const { data, error } = await serviceClient
      .from('qr_codes')
      .select(`
        id, 
        code_printed, 
        qr_key_canonical,
        created_at, 
        pack_id,
        image_url,
        claimed_item_id,
        claimed_by_user_id,
        claimed_at,
        pack:qr_code_packs(
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false })

    console.log('QR codes query result:', { 
      dataCount: data?.length || 0, 
      error: error?.message,
      hasData: !!data 
    })

    if (error) {
      console.error('Error fetching QR codes:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch codes', details: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully fetched QR codes:', data?.length || 0)

    // Transform data to match expected format
    const formattedCodes = (data || []).map(code => ({
      id: code.id,
      created_at: code.created_at,
      is_active: true, // All QR codes are active by default
      code_printed: code.code_printed,
      qr_key_canonical: code.qr_key_canonical,
      pack_id: code.pack_id,
      image_url: code.image_url,
      claimed_item_id: code.claimed_item_id,
      claimed_by_user_id: code.claimed_by_user_id,
      claimed_at: code.claimed_at,
      pack: code.pack // Include pack information
    }))

    console.log('Returning formatted codes:', formattedCodes.length)

    return new Response(
      JSON.stringify({ codes: formattedCodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in admin-qr-list:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
