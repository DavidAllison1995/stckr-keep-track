-- Create QR code packs table for organizing QR codes into batches
CREATE TABLE public.qr_code_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  physical_product_info TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on qr_code_packs
ALTER TABLE public.qr_code_packs ENABLE ROW LEVEL SECURITY;

-- Add pack_id column to qr_codes table
ALTER TABLE public.qr_codes ADD COLUMN pack_id UUID REFERENCES public.qr_code_packs(id) ON DELETE SET NULL;

-- Create RLS policies for qr_code_packs
CREATE POLICY "Admins can manage all packs" ON public.qr_code_packs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view their own packs" ON public.qr_code_packs
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own packs" ON public.qr_code_packs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own packs" ON public.qr_code_packs
  FOR UPDATE USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on qr_code_packs
CREATE TRIGGER update_qr_code_packs_updated_at
    BEFORE UPDATE ON public.qr_code_packs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_qr_codes_pack_id ON public.qr_codes(pack_id);
CREATE INDEX idx_qr_code_packs_created_by ON public.qr_code_packs(created_by);
CREATE INDEX idx_qr_code_packs_active ON public.qr_code_packs(is_active);

-- Create view for pack statistics
CREATE VIEW public.qr_pack_stats AS
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