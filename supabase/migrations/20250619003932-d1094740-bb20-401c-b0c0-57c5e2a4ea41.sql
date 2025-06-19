
-- Create table for global QR codes that admins generate
CREATE TABLE public.global_qr_codes (
  id TEXT PRIMARY KEY, -- e.g. "ABC123" 
  token TEXT NOT NULL UNIQUE, -- secure random UUID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create table for user claims on QR codes
CREATE TABLE public.user_qr_claims (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  code_id TEXT NOT NULL REFERENCES global_qr_codes(id),
  item_id UUID NOT NULL REFERENCES items(id),
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code_id, item_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_qr_claims_user_id ON public.user_qr_claims(user_id);
CREATE INDEX idx_user_qr_claims_code_id ON public.user_qr_claims(code_id);
CREATE INDEX idx_global_qr_codes_token ON public.global_qr_codes(token);

-- Enable RLS on user claims table
ALTER TABLE public.user_qr_claims ENABLE ROW LEVEL SECURITY;

-- Users can only see their own claims
CREATE POLICY "Users can view their own QR claims" 
  ON public.user_qr_claims 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own claims
CREATE POLICY "Users can create their own QR claims" 
  ON public.user_qr_claims 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own claims
CREATE POLICY "Users can delete their own QR claims" 
  ON public.user_qr_claims 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Global QR codes are readable by everyone (for status checks)
ALTER TABLE public.global_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Global QR codes are readable by all authenticated users" 
  ON public.global_qr_codes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete global QR codes (we'll handle admin logic in edge functions)
CREATE POLICY "Only service role can modify global QR codes" 
  ON public.global_qr_codes 
  FOR ALL 
  TO service_role
  USING (true);
