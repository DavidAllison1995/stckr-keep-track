
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadItemImage, deleteItemImage } from '@/services/imageUploadService';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

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

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    
    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

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
      setPreviewUrl(currentImageUrl || null);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
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

  // Convert base64 to File object
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Handle camera capture using Capacitor Camera API
  const handleTakePhoto = async () => {
    // Prevent multiple simultaneous calls
    if (isUploading) {
      return;
    }

    try {
      // Check if running on a mobile device with Capacitor
      if (!Capacitor.isNativePlatform()) {
        // Fallback to file input for web
        if (fileInputRef.current) {
          fileInputRef.current.setAttribute('capture', 'environment');
          fileInputRef.current.click();
        }
        return;
      }

      // Set uploading state to prevent multiple calls
      setIsUploading(true);

      // Check camera permissions first - critical for both iOS and Android
      console.log('Checking camera permissions...');
      const permissionStatus = await CapacitorCamera.checkPermissions();
      console.log('Permission status:', permissionStatus);
      
      if (permissionStatus.camera !== 'granted') {
        console.log('Requesting camera permissions...');
        const requestResult = await CapacitorCamera.requestPermissions();
        console.log('Permission request result:', requestResult);
        
        if (requestResult.camera !== 'granted') {
          toast({
            title: 'Camera permission required',
            description: 'Please allow camera access in Settings to take photos',
            variant: 'destructive',
          });
          return;
        }
      }

      // Check photo library permissions for iOS
      if (permissionStatus.photos !== 'granted') {
        console.log('Requesting photo library permissions...');
        const photoRequestResult = await CapacitorCamera.requestPermissions();
        console.log('Photo permission request result:', photoRequestResult);
      }

      console.log('Launching camera...');
      // Use Capacitor Camera API with proper error handling
      const image = await CapacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        presentationStyle: 'fullscreen',
        saveToGallery: false,
        // Force camera mode - don't show picker
        promptLabelHeader: 'Take Photo',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Picture',
      });

      console.log('Photo captured successfully:', {
        hasBase64: !!image.base64String,
        format: image.format
      });

      if (image.base64String) {
        // Convert base64 to File
        const file = base64ToFile(
          `data:${image.format === 'jpeg' ? 'image/jpeg' : 'image/png'};base64,${image.base64String}`,
          `photo_${Date.now()}.${image.format || 'jpg'}`
        );

        console.log('Converting and uploading photo...');
        // Process the file
        await handleFileSelect(file);
      } else {
        throw new Error('No image data received from camera');
      }
    } catch (error) {
      console.error('Camera error details:', error);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message.toLowerCase();
        
        if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorMessage.includes('user cancelled')) {
          console.log('User cancelled camera');
          return;
        }
        
        if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('not authorized')) {
          toast({
            title: 'Camera permission denied',
            description: 'Please enable camera access in your device Settings > Privacy > Camera',
            variant: 'destructive',
          });
          return;
        }

        if (errorMessage.includes('unavailable') || errorMessage.includes('not available') || errorMessage.includes('not supported')) {
          toast({
            title: 'Camera not available',
            description: 'Camera is not available on this device. Please choose from gallery instead.',
            variant: 'destructive',
          });
          return;
        }

        if (errorMessage.includes('busy') || errorMessage.includes('in use') || errorMessage.includes('already in use')) {
          toast({
            title: 'Camera busy',
            description: 'Camera is currently in use by another app. Please close other apps and try again.',
            variant: 'destructive',
          });
          return;
        }

        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          toast({
            title: 'Camera timeout',
            description: 'Camera failed to start within expected time. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      toast({
        title: 'Camera error',
        description: 'Failed to take photo. Please try again or choose from gallery.',
        variant: 'destructive',
      });
    } finally {
      // Always reset uploading state
      setIsUploading(false);
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
        // Silent fail for delete - image may have already been removed
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
            onClick={handleTakePhoto}
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
        accept={ALLOWED_TYPES.join(',')}
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
