-- Tighten RLS on order_items by removing any public access
begin;

-- Ensure RLS is enabled on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policy if it exists
DROP POLICY IF EXISTS "System can manage order items" ON public.order_items;

commit;