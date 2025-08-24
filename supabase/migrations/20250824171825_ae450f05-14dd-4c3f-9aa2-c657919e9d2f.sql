-- Remove the overly permissive policy that allows anyone to view all QR codes
DROP POLICY IF EXISTS "Anyone can view qr_codes" ON public.qr_codes;

-- Create restrictive policies for QR code access
CREATE POLICY "Users can view unclaimed QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (claimed_item_id IS NULL);

CREATE POLICY "Users can view their own claimed QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (claimed_by_user_id = auth.uid());

-- Keep admin access policy (already exists)
-- Policy "Admins can manage qr_codes" already covers admin access