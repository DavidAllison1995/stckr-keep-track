
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadItemImage, deleteItemImage } from '@/services/imageUploadService';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string | null) => void;
  userId: string;
  itemId: string;
  disabled?: boolean;
}

const ImageUpload = ({ currentImageUrl, onImageChange, userId, itemId, disabled }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to storage
      const result = await uploadItemImage(userId, itemId, file);
      
      // Clean up preview URL
      URL.revokeObjectURL(preview);
      
      // Update with actual URL
      setPreviewUrl(result.url);
      onImageChange(result.url);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setPreviewUrl(currentImageUrl || null);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      try {
        // Extract path from URL for deletion
        const urlParts = currentImageUrl.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'item-photos') + 1;
        const imagePath = urlParts.slice(pathIndex).join('/');
        
        await deleteItemImage(imagePath);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    
    setPreviewUrl(null);
    onImageChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Item Photo</Label>
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Item preview" 
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Controls */}
      {!previewUrl && !disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Choose Photo
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }
            }}
            disabled={isUploading}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-gray-500 flex items-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
