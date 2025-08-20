import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { quantity = 9 } = await req.json();

    console.log(`Generating ${quantity} QR codes for user ${user.id}`);

    // Generate unique QR codes with printed and canonical formats
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const codeId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codePrinted = `QR-${codeId}`;
      // qr_key_canonical will be set automatically by trigger
      codes.push({ 
        code: codePrinted, // Legacy field for compatibility
        code_printed: codePrinted
      });
    }

    // Insert codes into qr_codes table
    const { data, error } = await supabaseClient
      .from('qr_codes')
      .insert(codes)
      .select('id, code_printed, qr_key_canonical, created_at');

    if (error) {
      console.error('Error inserting QR codes:', error);
      return new Response('Failed to generate codes', { status: 500, headers: corsHeaders });
    }

    console.log(`Successfully generated ${data.length} QR codes`);

    return new Response(
      JSON.stringify({ 
        success: true,
        codes: data,
        count: data.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating QR codes:', error);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});