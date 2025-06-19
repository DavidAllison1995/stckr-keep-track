
-- Add image_url column to global_qr_codes table
ALTER TABLE global_qr_codes ADD COLUMN IF NOT EXISTS image_url text;
