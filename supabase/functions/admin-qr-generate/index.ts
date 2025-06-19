
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

    // Generate unique codes with QR images
    const codes = []
    
    for (let i = 0; i < quantity; i++) {
      const codeId = generateCodeId()
      const token = crypto.randomUUID()
      
      // Generate QR code URL
      const qrUrl = `https://4823056e-21ba-4628-9925-ad01b2666856.lovableproject.com/qr/${codeId}`
      
      // Generate QR code as data URL
      const qrDataUrl = await generateQRCodeWithOverlay(qrUrl, codeId)
      
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

async function generateQRCodeWithOverlay(url: string, codeId: string): Promise<string> {
  try {
    // Import QRCode dynamically
    const QRCode = await import('https://esm.sh/qrcode@1.5.3')
    
    // Generate basic QR code as data URL
    const qrDataUrl = await QRCode.default.toDataURL(url, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // For now, we'll return the basic QR code
    // In a real implementation, you'd use Canvas to overlay the text
    // But Deno doesn't have native Canvas support, so we'll use a simpler approach
    
    return qrDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}
