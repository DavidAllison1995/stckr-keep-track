
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
    console.log('=== Admin QR Delete Function Started ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header')
      return new Response('Authorization header required', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    console.log('User verification result:', { hasUser: !!user, error: authError?.message })
    
    if (authError || !user) {
      console.error('User authentication failed:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log('User authenticated:', user.email, 'ID:', user.id)

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { profile: profile?.is_admin, error: profileError?.message })

    if (profileError || !profile?.is_admin) {
      console.error('Admin access denied for user:', user.email)
      return new Response('Admin access required', { status: 403, headers: corsHeaders })
    }

    console.log('Admin access confirmed for user:', user.email)

    // Parse request body with comprehensive logging
    let requestBody
    let rawBodyText = ''
    
    try {
      rawBodyText = await req.text()
      console.log('Raw request body:', rawBodyText)
      console.log('Raw body length:', rawBodyText.length)
      console.log('Raw body type:', typeof rawBodyText)
      
      if (!rawBodyText || rawBodyText.trim() === '') {
        console.error('Request body is empty')
        return new Response(
          JSON.stringify({ error: 'Request body is required', received: rawBodyText }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      requestBody = JSON.parse(rawBodyText)
      console.log('Parsed request body:', requestBody)
      console.log('Request body type:', typeof requestBody)
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Failed to parse body:', rawBodyText)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          parseError: parseError.message,
          receivedBody: rawBodyText 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract codeId with flexible field names
    const codeId = requestBody.codeId || requestBody.qrId || requestBody.id
    console.log('Extracted codeId:', codeId)
    console.log('Available fields in request:', Object.keys(requestBody))
    
    if (!codeId) {
      console.error('No codeId found in request body')
      return new Response(
        JSON.stringify({ 
          error: 'Code ID is required', 
          availableFields: Object.keys(requestBody),
          requestBody: requestBody 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Attempting to delete QR code:', codeId)

    // Delete the QR code from qr_codes table (this will cascade to user_qr_claims)
    const { data: deleteData, error: deleteError } = await supabaseClient
      .from('qr_codes')
      .delete()
      .eq('id', codeId)

    console.log('Delete operation result:', { data: deleteData, error: deleteError })

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete code', 
          details: deleteError.message,
          codeId: codeId 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully deleted QR code:', codeId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'QR code deleted successfully',
        deletedCodeId: codeId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in admin-qr-delete:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
