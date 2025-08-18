-- FIX FUNCTION SEARCH PATH SECURITY WARNINGS
-- Update all functions to have proper search_path settings

-- Fix the user subscription function
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid uuid)
 RETURNS TABLE(plan_name text, features jsonb, status text, current_period_end timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name as plan_name,
    sp.features,
    COALESCE(us.status, 'active') as status,
    us.current_period_end
  FROM public.subscription_plans sp
  LEFT JOIN public.user_subscriptions us ON us.plan_id = sp.id AND us.user_id = user_uuid
  WHERE sp.name = 'Free' OR (us.user_id = user_uuid AND us.status = 'active')
  ORDER BY sp.price DESC
  LIMIT 1;
END;
$$;

-- Fix the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Fix the is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    false
  );
$$;

-- Fix the handle_new_user_subscription function
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'Free' LIMIT 1;
  
  -- Create subscription for new user
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, free_plan_id, 'active');
  
  RETURN NEW;
END;
$$;

-- Fix the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix the handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix the can_access_qr_code function
CREATE OR REPLACE FUNCTION public.can_access_qr_code(qr_code_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_qr_links uql
    WHERE uql.qr_code_id = qr_code_uuid AND uql.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_qr_claims uqc  
    WHERE uqc.qr_code_id = qr_code_uuid AND uqc.user_id = auth.uid()
  ) OR public.is_user_admin(auth.uid());
$$;