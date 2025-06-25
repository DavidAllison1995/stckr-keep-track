
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
    console.log('=== Admin QR Generate Function Started ===')
    
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
    console.log('User verification result:', { user: !!user, error: authError?.message })
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token', details: authError?.message }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.email, 'ID:', user.id)

    // Check if user is admin using service client
    console.log('Checking admin status for user:', user.id)
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
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

    console.log('Admin access confirmed for user:', user.email)

    // Parse request body with error handling
    let requestBody
    try {
      const bodyText = await req.text()
      console.log('Raw body text:', bodyText)
      
      if (!bodyText || bodyText.trim() === '') {
        console.log('Empty body, using default quantity')
        requestBody = {}
      } else {
        requestBody = JSON.parse(bodyText)
      }
      console.log('Parsed request body:', requestBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { quantity = 9 } = requestBody
    console.log('Generating QR codes with quantity:', quantity)

    // Generate unique codes with branded QR images
    const codes = []
    
    for (let i = 0; i < quantity; i++) {
      const codeId = generateCodeId()
      const token = crypto.randomUUID()
      
      // Use branded deep link format
      const qrUrl = `https://stckr.io/qr/${codeId}`
      
      // Generate QR code with larger square logo space
      const qrDataUrl = await generateBrandedQRCode(qrUrl, codeId)
      
      codes.push({ 
        id: codeId, 
        code: codeId,
        token,
        image_url: qrDataUrl
      })
    }

    console.log('Generated codes data:', codes.length)

    // Insert codes using service role client to bypass RLS
    const { data, error } = await serviceClient
      .from('qr_codes')
      .insert(codes.map(code => ({
        id: code.id,
        code: code.code
      })))
      .select()

    if (error) {
      console.error('Error inserting QR codes:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate codes', details: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully inserted QR codes to database:', data?.length || 0)

    // Return codes with image URLs for frontend display
    const returnCodes = codes.map((code, index) => ({
      id: code.id,
      code: code.code,
      created_at: new Date().toISOString(),
      is_active: true,
      image_url: code.image_url
    }))

    return new Response(
      JSON.stringify({ codes: returnCodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in admin-qr-generate:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateCodeId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateBrandedQRCode(url: string, codeId: string): Promise<string> {
  try {
    // Generate QR code with high error correction and larger square logo space
    // Using external service with custom parameters for branding
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?` +
      `size=500x500&` + // Larger size for better quality
      `data=${encodeURIComponent(url)}&` +
      `format=png&` +
      `ecc=H&` + // High error correction for larger logo space
      `color=000000&` + // Black modules
      `bgcolor=FFFFFF&` + // White background
      `margin=30&` + // Larger quiet zone padding
      `qzone=6` // Additional quiet zone for larger logo area
    
    const response = await fetch(qrApiUrl)
    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    const dataUrl = `data:image/png;base64,${base64}`
    
    return dataUrl
  } catch (error) {
    console.error('Error generating branded QR code:', error)
    throw error
  }
}
