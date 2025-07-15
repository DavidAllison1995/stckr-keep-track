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
      console.error('Authentication failed:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_user_admin', { user_id: user.id })

    if (adminError || !isAdmin) {
      console.error('Admin check failed:', adminError)
      return new Response('Forbidden - Admin access required', { status: 403, headers: corsHeaders })
    }

    console.log('=== Delete All QR Codes Request ===')
    console.log('Admin user:', user.email)

    if (req.method === 'POST') {
      console.log('Starting bulk delete of all QR codes...')

      // First, get count of codes to be deleted
      const { count: totalCount, error: countError } = await supabaseClient
        .from('qr_codes')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error getting code count:', countError)
        return new Response('Failed to get code count', { status: 500, headers: corsHeaders })
      }

      console.log(`Found ${totalCount} QR codes to delete`)

      if (totalCount === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No QR codes to delete', deletedCount: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete all user claims first (to avoid foreign key constraints)
      const { error: claimsError } = await supabaseClient
        .from('user_qr_claims')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (claimsError) {
        console.error('Error deleting user claims:', claimsError)
        return new Response('Failed to delete user claims', { status: 500, headers: corsHeaders })
      }

      console.log('Successfully deleted all user QR claims')

      // Delete all scan history
      const { error: scanHistoryError } = await supabaseClient
        .from('scan_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (scanHistoryError) {
        console.error('Error deleting scan history:', scanHistoryError)
        return new Response('Failed to delete scan history', { status: 500, headers: corsHeaders })
      }

      console.log('Successfully deleted all scan history')

      // Now delete all QR codes
      const { error: deleteError } = await supabaseClient
        .from('qr_codes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('Error deleting QR codes:', deleteError)
        return new Response('Failed to delete QR codes', { status: 500, headers: corsHeaders })
      }

      console.log(`Successfully deleted all ${totalCount} QR codes`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully deleted all ${totalCount} QR codes`,
          deletedCount: totalCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Error in delete all function:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})