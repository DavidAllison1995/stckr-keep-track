-- Fix RLS policies for user_qr_claims table
CREATE POLICY "Users can view their own QR claims" 
ON public.user_qr_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR claims" 
ON public.user_qr_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR claims" 
ON public.user_qr_claims 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR claims" 
ON public.user_qr_claims 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all QR claims" 
ON public.user_qr_claims 
FOR SELECT 
USING (is_user_admin(auth.uid()));

-- Secure database functions by adding search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    false
  );
$function$;

-- Remove duplicate RLS policies to clean up the database
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scan_history;
DROP POLICY IF EXISTS "Users can create their own scans" ON public.scan_history;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;