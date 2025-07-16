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
    const url = new URL(req.url)
    const qrCodeId = url.pathname.split('/').pop()

    if (!qrCodeId) {
      return new Response('QR Code ID required', { status: 400, headers: corsHeaders })
    }

    console.log(`=== QR Code Resolution Request ===`)
    console.log(`QR Code ID: ${qrCodeId}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Check if QR code is assigned to an item
    const { data: item, error } = await supabaseClient
      .from('items')
      .select('id, name, user_id')
      .eq('qr_code_id', qrCodeId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return new Response('Database error', { status: 500, headers: corsHeaders })
    }

    if (item) {
      console.log(`QR code ${qrCodeId} is assigned to item ${item.id} (${item.name})`)
      
      // Return the item information for redirection
      return new Response(
        JSON.stringify({
          success: true,
          assigned: true,
          item: {
            id: item.id,
            name: item.name,
            userId: item.user_id
          },
          redirectUrl: `https://stckr.io/item/${item.id}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.log(`QR code ${qrCodeId} is not assigned to any item`)
      
      // Check if the QR code exists in the qr_codes table
      const { data: qrCode, error: qrError } = await supabaseClient
        .from('qr_codes')
        .select('id, code')
        .eq('code', qrCodeId)
        .single()

      if (qrError && qrError.code !== 'PGRST116') {
        console.error('QR code lookup error:', qrError)
        return new Response('QR code lookup error', { status: 500, headers: corsHeaders })
      }

      if (qrCode) {
        // Valid QR code but not assigned
        return new Response(
          JSON.stringify({
            success: true,
            assigned: false,
            qrCode: qrCode.code,
            redirectUrl: `https://stckr.io/qr/${qrCode.code}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // QR code doesn't exist
        return new Response(
          JSON.stringify({
            success: false,
            error: 'QR code not found',
            redirectUrl: 'https://stckr.io'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})