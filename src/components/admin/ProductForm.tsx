
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    printful_product_id: string | null;
    printful_variant_id: string | null;
    template_url: string | null;
    is_active: boolean;
  } | null;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const ProductForm = ({ product, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    image_url: product?.image_url || '',
    printful_product_id: product?.printful_product_id || '',
    printful_variant_id: product?.printful_variant_id || '',
    template_url: product?.template_url || '',
    is_active: product?.is_active ?? true,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Supported file types
  const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return 'Upload failed: Unsupported file type. Please use JPG, JPEG, PNG, or WebP format.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'Upload failed: File too large. Maximum size is 20MB.';
    }

    return null;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height while maintaining aspect ratio)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          file.type,
          0.8 // 80% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError(null);
    
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Compress image for better performance
      const processedFile = await compressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        if (error.message.includes('row-level security')) {
          throw new Error('Upload failed: Permission denied. Please contact support.');
        } else if (error.message.includes('size')) {
          throw new Error('Upload failed: File too large.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed: Unknown error occurred.';
      setUploadError(errorMessage);
      toast({
        title: 'Upload Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && SUPPORTED_TYPES.includes(file.type)) {
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      handleImageUpload(file);
    } else {
      setUploadError('Please drop a valid image file (JPG, PNG, WebP).');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = async () => {
    // If there's an existing image URL, try to delete it from storage
    if (formData.image_url && formData.image_url.includes('product-images')) {
      try {
        const fileName = formData.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('product-images')
            .remove([fileName]);
        }
      } catch (error) {
        console.error('Error removing image from storage:', error);
      }
    }

    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={uploadingImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-sm">Uploading...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingImage}
                      className="relative"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileSelect}
                        disabled={uploadingImage}
                      />
                    </Button>
                    <p className="text-sm text-gray-500">
                      Drag & drop or click to upload<br />
                      JPG, PNG, WebP up to 20MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload Error Alert */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter product name"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description, features, shipping info, etc."
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
              placeholder="0.00"
            />
          </div>

          {/* Printful Integration Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printful_product_id">Printful Product ID</Label>
              <Input
                id="printful_product_id"
                value={formData.printful_product_id}
                onChange={(e) => setFormData(prev => ({ ...prev, printful_product_id: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="printful_variant_id">Printful Variant ID</Label>
              <Input
                id="printful_variant_id"
                value={formData.printful_variant_id}
                onChange={(e) => setFormData(prev => ({ ...prev, printful_variant_id: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_url">Template URL</Label>
            <Input
              id="template_url"
              value={formData.template_url}
              onChange={(e) => setFormData(prev => ({ ...prev, template_url: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploadingImage}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
