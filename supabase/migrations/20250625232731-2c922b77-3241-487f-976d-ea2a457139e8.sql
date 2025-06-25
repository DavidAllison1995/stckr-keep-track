
-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-photos',
  'item-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create storage policies for item photos
CREATE POLICY "Users can upload their own item photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view item photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-photos');

CREATE POLICY "Users can update their own item photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own item photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
