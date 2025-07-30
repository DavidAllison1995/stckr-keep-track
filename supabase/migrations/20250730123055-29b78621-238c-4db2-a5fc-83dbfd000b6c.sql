-- Fix search_path security warnings for functions
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid uuid)
 RETURNS TABLE(plan_name text, features jsonb, status text, current_period_end timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;