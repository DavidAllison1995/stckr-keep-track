
-- Create storage bucket for product images with higher size limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  20971520, -- 20MB limit (20 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create storage policy to allow public uploads to product-images bucket
CREATE POLICY "Anyone can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Create storage policy to allow public viewing of product images
CREATE POLICY "Product images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Create storage policy to allow updating product images
CREATE POLICY "Anyone can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- Create storage policy to allow deleting product images
CREATE POLICY "Anyone can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
