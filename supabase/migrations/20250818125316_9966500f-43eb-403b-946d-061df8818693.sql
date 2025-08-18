-- CRITICAL SECURITY FIX: Admin Privilege Escalation Prevention
-- Drop the dangerous broad profile update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create restricted profile update policies
-- Users can only update non-sensitive profile fields (not is_admin)
CREATE POLICY "Users can update profile details" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id AND NOT is_user_admin(id))
WITH CHECK (auth.uid() = id AND NOT is_user_admin(id));

-- Only admins can modify any profile including admin status
CREATE POLICY "Admins can manage all profiles" 
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
WITH CHECK (auth.role() = 'service_role');

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
-- Create a function to check QR access permissions
CREATE OR REPLACE FUNCTION public.can_access_qr_code(qr_code_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_qr_links uql
    WHERE uql.qr_code_id = qr_code_uuid AND uql.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_qr_claims uqc  
    WHERE uqc.qr_code_id = qr_code_uuid AND uqc.user_id = auth.uid()
  ) OR is_user_admin(auth.uid());
$$;

-- Replace loose scan history policy with rate-limited version
DROP POLICY IF EXISTS "Anyone can insert scan history" ON public.scan_history;
CREATE POLICY "Authenticated users can create scan history with rate limit" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (
    SELECT COUNT(*) 
    FROM public.scan_history 
    WHERE user_id = auth.uid() 
    AND scanned_at > NOW() - INTERVAL '1 hour'
  ) < 100
);

-- AUDIT LOGGING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_user_admin(auth.uid()));

CREATE POLICY "Service role can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');