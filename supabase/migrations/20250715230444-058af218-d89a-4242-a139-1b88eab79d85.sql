-- Add image_url column to qr_codes table to store generated QR code images
ALTER TABLE public.qr_codes 
ADD COLUMN image_url TEXT;