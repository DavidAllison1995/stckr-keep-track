
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import QRCode from 'https://esm.sh/qrcode@1.5.4'

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

    const { quantity = 9, packName, packDescription, physicalProductInfo } = requestBody

    console.log('=== QR Code Generation Request ===')
    console.log('Quantity:', quantity)
    console.log('Pack Name:', packName)
    console.log('Pack Description:', packDescription)
    console.log('Physical Product Info:', physicalProductInfo)

    let packId = null

    // Create pack if pack name is provided
    if (packName && packName.trim()) {
      console.log('Creating pack with name:', packName)
      const { data: pack, error: packError } = await serviceClient
        .from('qr_code_packs')
        .insert({
          name: packName.trim(),
          description: packDescription?.trim() || null,
          physical_product_info: physicalProductInfo?.trim() || null,
          created_by: user.id
        })
        .select()
        .single()

      if (packError) {
        console.error('Error creating pack:', packError)
        return new Response(
          JSON.stringify({ error: 'Failed to create pack', details: packError.message }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      packId = pack.id
      console.log('Successfully created pack with ID:', packId)
    } else {
      console.log('No pack name provided, creating QR codes without pack')
    }

    // Generate unique codes with white QR on dark background
    const codes = []
    
    for (let i = 0; i < quantity; i++) {
      const codeId = generateCodeId()
      const token = crypto.randomUUID()
      
      // Use functioning deep link URL
      const qrUrl = `https://stckr.io/qr/${codeId}`
      
      // Generate white QR code on dark transparent background - no white fill/padding
      const qrDataUrl = await generateDarkOptimizedQRCode(qrUrl)
      
      codes.push({ 
        id: crypto.randomUUID(),
        code: codeId,
        token,
        image_url: qrDataUrl,
        pack_id: packId
      })
    }

    // Insert codes using service role client to bypass RLS
    const { data, error } = await serviceClient
      .from('qr_codes')
      .insert(codes.map(code => ({
        id: code.id,
        code: code.code,
        pack_id: code.pack_id,
        image_url: code.image_url
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
      JSON.stringify({ 
        codes: returnCodes,
        pack: packId ? { id: packId, name: packName } : null
      }),
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

async function generateDarkOptimizedQRCode(url: string): Promise<string> {
  try {
    // Generate white QR code with transparent/dark background - NO white padding or fill
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?` +
      `size=512x512&` + // High resolution for print quality
      `data=${encodeURIComponent(url)}&` +
      `format=png&` +
      `ecc=H&` + // High error correction for logo space
      `color=FFFFFF&` + // Pure white QR modules/foreground
      `bgcolor=1E1E2F&` + // Dark grey background (no transparency to ensure visibility)
      `margin=0&` + // NO margin/padding - remove white space
      `qzone=1` // Minimal quiet zone to preserve logo space but no white fill
    
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
