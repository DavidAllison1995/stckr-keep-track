-- Create new user_qr_links table for shared QR codes
CREATE TABLE public.user_qr_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one QR code per user can only be linked to one item
  UNIQUE(user_id, qr_code_id)
);

-- Enable RLS
ALTER TABLE public.user_qr_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own QR links" 
ON public.user_qr_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR links" 
ON public.user_qr_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR links" 
ON public.user_qr_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR links" 
ON public.user_qr_links 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all QR links" 
ON public.user_qr_links 
FOR SELECT 
USING (is_user_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_user_qr_links_user_id ON public.user_qr_links(user_id);
CREATE INDEX idx_user_qr_links_qr_code_id ON public.user_qr_links(qr_code_id);
CREATE INDEX idx_user_qr_links_item_id ON public.user_qr_links(item_id);

-- Remove legacy qr_code_id column from items table
ALTER TABLE public.items DROP COLUMN IF EXISTS qr_code_id;

-- Disable the user_qr_claims table by removing all policies (making it inaccessible)
DROP POLICY IF EXISTS "Users can view their own claims" ON public.user_qr_claims;
DROP POLICY IF EXISTS "Users can create their own claims" ON public.user_qr_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON public.user_qr_claims;
DROP POLICY IF EXISTS "Users can delete their own claims" ON public.user_qr_claims;
DROP POLICY IF EXISTS "Admins can view all claims" ON public.user_qr_claims;

-- Drop the claim_qr function as it's no longer needed
DROP FUNCTION IF EXISTS public.claim_qr(text, uuid, uuid);