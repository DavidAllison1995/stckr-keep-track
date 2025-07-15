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

    // Get all QR codes that don't have image_url
    const { data: qrCodes, error: fetchError } = await serviceClient
      .from('qr_codes')
      .select('id, code')
      .is('image_url', null)

    if (fetchError) {
      console.error('Error fetching QR codes:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch QR codes' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${qrCodes?.length || 0} QR codes without images`)

    if (!qrCodes || qrCodes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No QR codes need image generation' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate images for each QR code
    const updates = []
    for (const qrCode of qrCodes) {
      try {
        const qrUrl = `https://stckr.io/qr/${qrCode.code}`
        const qrDataUrl = await generateDarkOptimizedQRCode(qrUrl)
        
        updates.push({
          id: qrCode.id,
          image_url: qrDataUrl
        })
      } catch (error) {
        console.error(`Failed to generate image for code ${qrCode.code}:`, error)
      }
    }

    // Update QR codes with images
    for (const update of updates) {
      const { error: updateError } = await serviceClient
        .from('qr_codes')
        .update({ image_url: update.image_url })
        .eq('id', update.id)

      if (updateError) {
        console.error(`Failed to update QR code ${update.id}:`, updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully generated images for ${updates.length} QR codes`,
        updated: updates.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in regenerate images function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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