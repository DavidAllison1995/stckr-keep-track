-- Add columns to user_subscriptions table to track native subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_source TEXT CHECK (subscription_source IN ('stripe', 'apple', 'google')),
ADD COLUMN IF NOT EXISTS native_transaction_id TEXT;

-- Update the get_user_subscription function to handle all subscription sources
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid uuid)
 RETURNS TABLE(plan_name text, features jsonb, status text, current_period_end timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
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