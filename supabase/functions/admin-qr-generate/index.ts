
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

    // Always generate 9 QR codes per batch
    const quantity = 9

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
        token,
        image_url: qrDataUrl
      })
    }

    // Insert codes using service role
    const { data, error } = await supabaseClient
      .from('global_qr_codes')
      .insert(codes)
      .select()

    if (error) {
      console.error('Error inserting QR codes:', error)
      return new Response('Failed to generate codes', { status: 500, headers: corsHeaders })
    }

    return new Response(
      JSON.stringify({ codes: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
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
