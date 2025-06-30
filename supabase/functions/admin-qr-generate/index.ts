
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using service client
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
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

    // Parse request body with error handling
    let requestBody
    try {
      const bodyText = await req.text()
      
      if (!bodyText || bodyText.trim() === '') {
        requestBody = {}
      } else {
        requestBody = JSON.parse(bodyText)
      }
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { quantity = 9 } = requestBody

    // Generate unique codes with white QR on black background
    const codes = []
    
    for (let i = 0; i < quantity; i++) {
      const codeId = generateCodeId()
      const token = crypto.randomUUID()
      
      // Use functioning deep link URL
      const qrUrl = `https://stckr.app/qr/${codeId}`
      
      // Generate high-quality white QR code on black background
      const qrDataUrl = await generatePrintReadyQRCode(qrUrl)
      
      codes.push({ 
        id: crypto.randomUUID(),
        code: codeId,
        token,
        image_url: qrDataUrl
      })
    }

    // Insert codes using service role client to bypass RLS
    const { data, error } = await serviceClient
      .from('qr_codes')
      .insert(codes.map(code => ({
        id: code.id,
        code: code.code
      })))
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate codes' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
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

async function generatePrintReadyQRCode(url: string): Promise<string> {
  try {
    // Generate high-quality white QR code on solid black background for maximum visibility
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?` +
      `size=512x512&` + // High resolution for print quality (300+ DPI equivalent)
      `data=${encodeURIComponent(url)}&` +
      `format=png&` +
      `ecc=H&` + // High error correction for logo space
      `color=FFFFFF&` + // Pure white foreground
      `bgcolor=000000&` + // Solid black background for visibility
      `margin=30&` + // Safe cutting margin for printing
      `qzone=12` // Extra quiet zone for logo area
    
    const response = await fetch(qrApiUrl)
    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    const dataUrl = `data:image/png;base64,${base64}`
    
    return dataUrl
  } catch (error) {
    console.error('QR code generation failed:', error)
    throw new Error('QR code generation failed')
  }
}
