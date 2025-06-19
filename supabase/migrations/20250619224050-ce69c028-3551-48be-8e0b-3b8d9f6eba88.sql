
-- Drop existing table if it exists and create new schema
DROP TABLE IF EXISTS public.user_qr_claims;
DROP TABLE IF EXISTS public.global_qr_codes;

-- Create the new qr_codes table with your specified schema
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_user_id UUID REFERENCES auth.users(id),
  assigned_item_id UUID REFERENCES public.items(id)
);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins can see all, users can only see their own
CREATE POLICY "Admins can view all qr_codes" ON public.qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert qr_codes" ON public.qr_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update qr_codes" ON public.qr_codes
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete qr_codes" ON public.qr_codes
  FOR DELETE USING (true);

-- Create the claim_qr RPC function
CREATE OR REPLACE FUNCTION public.claim_qr(
  p_code TEXT,
  p_user_id UUID,
  p_item_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  qr_record RECORD;
  result JSON;
BEGIN
  -- Check if code exists
  SELECT * INTO qr_record FROM public.qr_codes WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'QR code not found');
  END IF;
  
  -- Check if already assigned
  IF qr_record.assigned_user_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'QR code already assigned');
  END IF;
  
  -- Verify user owns the item
  IF NOT EXISTS (
    SELECT 1 FROM public.items 
    WHERE id = p_item_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or access denied');
  END IF;
  
  -- Claim the QR code
  UPDATE public.qr_codes 
  SET assigned_user_id = p_user_id, assigned_item_id = p_item_id
  WHERE code = p_code;
  
  RETURN json_build_object('success', true, 'message', 'QR code claimed successfully');
END;
$$;
