-- Drop the existing view
DROP VIEW IF EXISTS public.qr_pack_stats;

-- Recreate the view with explicit security settings
CREATE VIEW public.qr_pack_stats 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.physical_product_info,
  p.created_by,
  p.created_at,
  p.updated_at,
  p.is_active,
  COUNT(qr.id) as qr_code_count,
  COUNT(CASE WHEN qr.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_codes
FROM public.qr_code_packs p
LEFT JOIN public.qr_codes qr ON p.id = qr.pack_id
GROUP BY p.id, p.name, p.description, p.physical_product_info, p.created_by, p.created_at, p.updated_at, p.is_active;