
import { supabase } from '@/integrations/supabase/client';

export const uploadDocument = async (userId: string, itemId: string, file: File): Promise<string> => {
  console.log('Starting document upload for item:', itemId, 'File:', file.name, 'Size:', file.size);

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${itemId}/${fileName}`;

  console.log('Uploading file:', { filePath, fileSize: file.size, fileType: file.type });

  const { error: uploadError } = await supabase.storage
    .from('item-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('item-documents')
    .getPublicUrl(filePath);

  console.log('File uploaded successfully:', publicUrl);
  return publicUrl;
};

export const deleteDocument = async (documentUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = documentUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'item-documents');
    if (bucketIndex === -1) {
      throw new Error('Invalid document URL');
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    console.log('Deleting file:', filePath);

    const { error } = await supabase.storage
      .from('item-documents')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  }
};
