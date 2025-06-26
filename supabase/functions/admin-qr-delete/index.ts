
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
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return new Response('Admin access required', { status: 403, headers: corsHeaders })
    }

    // Parse request body safely
    let requestBody
    try {
      const bodyText = await req.text()
      if (!bodyText || bodyText.trim() === '') {
        return new Response('Request body is required', { status: 400, headers: corsHeaders })
      }
      requestBody = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response('Invalid JSON in request body', { status: 400, headers: corsHeaders })
    }

    const { codeId } = requestBody
    
    if (!codeId) {
      return new Response('Code ID is required', { status: 400, headers: corsHeaders })
    }

    console.log('Attempting to delete QR code:', codeId)

    // Delete the QR code from qr_codes table (this will cascade to user_qr_claims)
    const { error } = await supabaseClient
      .from('qr_codes')
      .delete()
      .eq('id', codeId)

    if (error) {
      console.error('Error deleting QR code:', error)
      return new Response('Failed to delete code', { status: 500, headers: corsHeaders })
    }

    console.log('Successfully deleted QR code:', codeId)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
