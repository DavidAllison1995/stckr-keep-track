import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Input validation and sanitization
function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&]/g, '').trim().substring(0, 255);
}

function validateQRCode(code: string): boolean {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function validateUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

// Rate limiting storage (simple in-memory)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 300000; // 5 minutes
  const maxRequests = 10; // 10 claims per 5 minutes per user

  const current = rateLimitStore.get(userId) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  rateLimitStore.set(userId, current);
  return current.count <= maxRequests;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  try {
    const url = new URL(req.url)
    // Try to resolve the QR code from multiple sources: body (POST), query, or path suffix
    let body: any = {}
    if (req.method === 'POST') {
      body = await req.json().catch(() => ({}))
    }

    const codeFromPath = url.pathname.split('/').pop()
    const codeFromQuery = url.searchParams.get('code') || url.searchParams.get('codeId') || url.searchParams.get('qrCodeId')
    const codeFromBody = body?.codeId || body?.qrCodeId

    const resolvedCode = [codeFromBody, codeFromQuery, codeFromPath]
      .find((c) => c && c !== 'qr-claim') as string | undefined

    if (!resolvedCode || !validateQRCode(resolvedCode)) {
      console.error('Invalid QR code format:', resolvedCode, 'from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Valid QR code required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const sanitizedCode = sanitizeInput(resolvedCode);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Authorization required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message, 'from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limiting for authenticated user
    if (!checkRateLimit(user.id)) {
      console.warn('Rate limit exceeded for user:', user.id, 'from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'GET') {
      // Get user's claim for this code
      const { data, error } = await supabaseClient
        .from('user_qr_claims')
        .select(`
          *,
          qr_codes!inner (
            code
          ),
          items (
            id,
            name
          )
        `)
        .eq('qr_codes.code', sanitizedCode)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching claim:', error.message, 'for user:', user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch claim' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ claim: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { itemId } = (body || {}) as { itemId?: string }

      // If no itemId provided, treat this POST as a read (some clients cannot send GET with body)
      if (!itemId) {
        const { data, error } = await supabaseClient
          .from('user_qr_claims')
          .select(`
            *,
            qr_codes!inner (
              code
            ),
            items (
              id,
              name
            )
          `)
          .eq('qr_codes.code', sanitizedCode)
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching claim (POST-read):', error.message, 'for user:', user.id);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch claim' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ claim: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!validateUUID(itemId)) {
        console.error('Invalid item ID provided:', itemId, 'by user:', user.id);
        return new Response(
          JSON.stringify({ error: 'Valid item ID required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Log claim attempt for audit
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseAdmin.from('security_audit_log').insert({
        user_id: user.id,
        event_type: 'qr_claim_attempt',
        event_data: { 
          qr_code: sanitizedCode, 
          item_id: itemId,
          client_ip: clientIP
        },
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent')
      }).catch(err => console.error('Audit log error:', err));

      // Use the RPC function to claim the code
      const { data, error } = await supabaseClient.rpc('claim_qr', {
        p_code: sanitizedCode,
        p_user_id: user.id,
        p_item_id: itemId
      })

      if (error) {
        console.error('Error claiming code:', error.message, 'for user:', user.id);
        
        // Log failed claim for audit
        await supabaseAdmin.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'qr_claim_failed',
          event_data: { 
            qr_code: sanitizedCode, 
            item_id: itemId,
            error: error.message,
            client_ip: clientIP
          },
          ip_address: clientIP,
          user_agent: req.headers.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
        
        return new Response(
          JSON.stringify({ error: 'Failed to claim code' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = data as { success: boolean; error?: string; message?: string }

      if (!result.success) {
        console.warn('QR claim rejected:', result.error, 'for user:', user.id);
        return new Response(
          JSON.stringify({ error: result.error }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Log successful claim
      await supabaseAdmin.from('security_audit_log').insert({
        user_id: user.id,
        event_type: 'qr_claim_success',
        event_data: { 
          qr_code: sanitizedCode, 
          item_id: itemId,
          client_ip: clientIP
        },
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent')
      }).catch(err => console.error('Audit log error:', err));

      console.log('QR code claimed successfully:', sanitizedCode, 'by user:', user.id);
      return new Response(
        JSON.stringify({ success: true, message: result.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in qr-claim:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})