
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response('Unauthorized - No auth header', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token received:', token ? 'Present' : 'Missing')
    
    // Create client with anon key to verify user
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    // Set the auth token
    await anonClient.auth.setSession({
      access_token: token,
      refresh_token: ''
    })
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response('Unauthorized - Invalid token', { status: 401, headers: corsHeaders })
    }

    console.log('User authenticated:', user.email)

    // Create service role client for admin operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user is admin
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.error('Admin check failed:', profileError, 'is_admin:', profile?.is_admin)
      return new Response('Forbidden - Admin access required', { status: 403, headers: corsHeaders })
    }

    console.log('Admin access confirmed for user:', user.email)

    // Get all QR codes from the qr_codes table
    const { data, error } = await serviceClient
      .from('qr_codes')
      .select('id, code, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching QR codes:', error)
      return new Response('Failed to fetch codes', { status: 500, headers: corsHeaders })
    }

    console.log('Successfully fetched QR codes:', data?.length || 0)

    // Transform data to match expected format
    const formattedCodes = data.map(code => ({
      id: code.id,
      created_at: code.created_at,
      is_active: true, // All QR codes are active by default
      code: code.code
    }))

    return new Response(
      JSON.stringify({ codes: formattedCodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
