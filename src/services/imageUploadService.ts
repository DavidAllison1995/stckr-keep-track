
import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export const uploadItemImage = async (
  userId: string,
  itemId: string,
  file: File
): Promise<ImageUploadResult> => {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    throw new Error('File size must be less than 10MB');
  }

  // Compress and resize image if needed
  const processedFile = await compressImage(file);
  
  // Create file path: userId/itemId/filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${itemId}/${fileName}`;

  // Delete any existing image for this item (only for existing items, not temp IDs)
  if (!itemId.startsWith('temp-')) {
    await deleteExistingItemImage(userId, itemId);
  }

  // Upload new image
  const { data, error } = await supabase.storage
    .from('item-photos')
    .upload(filePath, processedFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('item-photos')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path
  };
};

export const deleteItemImage = async (imagePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('item-photos')
    .remove([imagePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete image');
  }
};

const deleteExistingItemImage = async (userId: string, itemId: string): Promise<void> => {
  try {
    const { data: files } = await supabase.storage
      .from('item-photos')
      .list(`${userId}/${itemId}`);

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${userId}/${itemId}/${file.name}`);
      await supabase.storage
        .from('item-photos')
        .remove(filePaths);
    }
  } catch (error) {
    console.error('Error deleting existing images:', error);
  }
};

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1080px width)
      const maxWidth = 1080;
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        file.type,
        0.8 // 80% quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};
