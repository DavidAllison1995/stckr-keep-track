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
    
    // Create anon client for user verification
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )
    
    // Verify user with the token
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.email, 'ID:', user.id)

    // Check if user is admin using service client
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile lookup failed:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }), 
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

    console.log('Admin access confirmed for user:', user.email)

    // Get request body
    const { packId } = await req.json()
    
    if (!packId) {
      return new Response(
        JSON.stringify({ error: 'Pack ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Deleting pack with ID:', packId)

    // Get pack details first (for logging and validation)
    const { data: pack, error: packError } = await serviceClient
      .from('qr_code_packs')
      .select('id, name')
      .eq('id', packId)
      .single()

    if (packError) {
      console.error('Pack lookup failed:', packError)
      return new Response(
        JSON.stringify({ error: 'Pack not found or access denied' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found pack "${pack.name}", starting deletion process`)

    // Get all QR code IDs in this pack first
    const { data: qrCodes, error: qrCodesError } = await serviceClient
      .from('qr_codes')
      .select('id')
      .eq('pack_id', packId)

    if (qrCodesError) {
      console.error('Error fetching QR codes:', qrCodesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch QR codes for pack' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const qrCodeIds = qrCodes?.map(code => code.id) || []
    console.log(`Found ${qrCodeIds.length} QR codes to delete`)

    // Delete user claims for QR codes in this pack
    if (qrCodeIds.length > 0) {
      const { error: claimsError } = await serviceClient
        .from('user_qr_claims')
        .delete()
        .in('qr_code_id', qrCodeIds)

      if (claimsError) {
        console.error('Error deleting user claims:', claimsError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete user claims' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User claims deleted successfully')

      // Delete scan history for QR codes in this pack
      const { error: scanError } = await serviceClient
        .from('scan_history')
        .delete()
        .in('qr_code_id', qrCodeIds)

      if (scanError) {
        console.error('Error deleting scan history:', scanError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete scan history' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Scan history deleted successfully')
    }

    // Delete all QR codes in the pack
    const { error: codesError } = await serviceClient
      .from('qr_codes')
      .delete()
      .eq('pack_id', packId)

    if (codesError) {
      console.error('Error deleting QR codes:', codesError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete QR codes' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('QR codes deleted successfully')

    // Finally, delete the pack itself
    const { error: packDeleteError } = await serviceClient
      .from('qr_code_packs')
      .delete()
      .eq('id', packId)

    if (packDeleteError) {
      console.error('Error deleting pack:', packDeleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete pack' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Pack "${pack.name}" and all associated data deleted successfully`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Pack "${pack.name}" and all ${qrCodeIds.length} QR codes deleted successfully`,
        deletedPackId: packId,
        deletedPackName: pack.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in pack delete function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})