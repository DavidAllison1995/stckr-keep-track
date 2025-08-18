-- CRITICAL SECURITY FIX: Admin Privilege Escalation Prevention
-- Drop the dangerous broad profile update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create restricted profile update policies
-- Users can only update non-sensitive profile fields
CREATE POLICY "Users can update profile details" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure is_admin cannot be changed by regular users
  (OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin)
);

-- Only admins can modify admin status
CREATE POLICY "Admins can manage admin status" 
ON public.profiles 
FOR UPDATE 
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- SYSTEM POLICY HARDENING
-- Fix overly permissive notifications policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Service role can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Only allow service role or authenticated edge functions
  auth.role() = 'service_role' OR
  (auth.uid() IS NOT NULL AND current_setting('request.jwt.claims', true)::jsonb->>'iss' = 'https://cudftlquaydissmvqjmv.supabase.co/auth/v1')
);

-- Fix overly permissive orders policies  
DROP POLICY IF EXISTS "System can create orders" ON public.orders;
DROP POLICY IF EXISTS "System can update orders" ON public.orders;

CREATE POLICY "Service role can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update orders" 
ON public.orders 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Fix overly permissive user_subscriptions policies
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.user_subscriptions;

CREATE POLICY "Service role can manage subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add proper user subscription access
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- QR CODE SECURITY IMPROVEMENTS
-- Add rate limiting and proper access control for QR operations
-- Create a function to check QR access permissions
CREATE OR REPLACE FUNCTION public.can_access_qr_code(qr_code_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Allow access if user owns the QR code through assignment or claiming
  SELECT EXISTS (
    SELECT 1 FROM public.user_qr_links uql
    WHERE uql.qr_code_id = qr_code_uuid AND uql.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_qr_claims uqc  
    WHERE uqc.qr_code_id = qr_code_uuid AND uqc.user_id = auth.uid()
  ) OR is_user_admin(auth.uid());
$$;

-- Add proper RLS for scan_history with rate limiting considerations
CREATE POLICY "Users can create scan history with validation" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  -- Basic rate limiting: max 100 scans per hour per user
  (
    SELECT COUNT(*) 
    FROM public.scan_history 
    WHERE user_id = auth.uid() 
    AND scanned_at > NOW() - INTERVAL '1 hour'
  ) < 100
);

-- AUDIT LOGGING ENHANCEMENTS
-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_user_admin(auth.uid()));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');