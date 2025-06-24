
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
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response('Unauthorized - No auth header', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify user is authenticated using the anon key client
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response('Unauthorized - Invalid token', { status: 401, headers: corsHeaders })
    }

    console.log('User authenticated:', user.email)

    // Check if user is admin using service role client
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.error('Admin check failed:', profileError, 'is_admin:', profile?.is_admin)
      return new Response('Forbidden - Admin access required', { status: 403, headers: corsHeaders })
    }

    console.log('Admin access confirmed for user:', user.email)

    // Get all global QR codes including image_url using service role
    const { data, error } = await supabaseClient
      .from('global_qr_codes')
      .select('id, created_at, is_active, image_url')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching QR codes:', error)
      return new Response('Failed to fetch codes', { status: 500, headers: corsHeaders })
    }

    console.log('Successfully fetched QR codes:', data?.length || 0)

    return new Response(
      JSON.stringify({ codes: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
