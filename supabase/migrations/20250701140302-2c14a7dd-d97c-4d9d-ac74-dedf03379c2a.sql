
-- Create table to store printable sticker file information
CREATE TABLE public.printable_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.printable_files ENABLE ROW LEVEL SECURITY;

-- Admin can manage printable files
CREATE POLICY "Admins can manage printable files"
  ON public.printable_files
  FOR ALL
  USING (is_user_admin(auth.uid()));

-- Anyone can view printable files (for download)
CREATE POLICY "Anyone can view printable files"
  ON public.printable_files
  FOR SELECT
  USING (true);

-- Create storage bucket for printable files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('printable-files', 'printable-files', true);

-- Add storage policies
CREATE POLICY "Admins can upload printable files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'printable-files' AND 
    is_user_admin(auth.uid())
  );

CREATE POLICY "Admins can update printable files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'printable-files' AND 
    is_user_admin(auth.uid())
  );

CREATE POLICY "Admins can delete printable files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'printable-files' AND 
    is_user_admin(auth.uid())
  );

CREATE POLICY "Anyone can view printable files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'printable-files');
