
-- Drop the existing qr_codes table and create the new schema
DROP TABLE IF EXISTS public.qr_codes;

-- Create the master qr_codes table (no user assignment fields)
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the user_qr_claims join table
CREATE TABLE public.user_qr_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(qr_code_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_qr_claims ENABLE ROW LEVEL SECURITY;

-- QR codes policies (admins can manage, users can view)
CREATE POLICY "Anyone can view qr_codes" ON public.qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes
  FOR ALL USING (true);

-- User claims policies (users can only see/manage their own claims)
CREATE POLICY "Users can view their own claims" ON public.user_qr_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" ON public.user_qr_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON public.user_qr_claims
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claims" ON public.user_qr_claims
  FOR DELETE USING (auth.uid() = user_id);

-- Update the claim_qr RPC function for the new schema
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
  existing_claim RECORD;
BEGIN
  -- Check if master code exists
  SELECT * INTO qr_record FROM public.qr_codes WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'QR code not found');
  END IF;
  
  -- Check if user already has a claim for this code
  SELECT * INTO existing_claim 
  FROM public.user_qr_claims 
  WHERE qr_code_id = qr_record.id AND user_id = p_user_id;
  
  IF FOUND THEN
    -- Update existing claim with new item
    UPDATE public.user_qr_claims 
    SET item_id = p_item_id, claimed_at = now()
    WHERE qr_code_id = qr_record.id AND user_id = p_user_id;
    
    RETURN json_build_object('success', true, 'message', 'QR code claim updated successfully');
  END IF;
  
  -- Verify user owns the item
  IF NOT EXISTS (
    SELECT 1 FROM public.items 
    WHERE id = p_item_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or access denied');
  END IF;
  
  -- Create new claim
  INSERT INTO public.user_qr_claims (qr_code_id, user_id, item_id)
  VALUES (qr_record.id, p_user_id, p_item_id);
  
  RETURN json_build_object('success', true, 'message', 'QR code claimed successfully');
END;
$$;
