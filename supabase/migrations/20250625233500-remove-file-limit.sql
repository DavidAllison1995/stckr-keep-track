
-- Remove file size limit from item-photos bucket
UPDATE storage.buckets 
SET file_size_limit = NULL 
WHERE id = 'item-photos';
