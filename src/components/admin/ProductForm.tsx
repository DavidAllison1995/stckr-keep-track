
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const urlOrPathSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === '' || /^https?:\/\/.+/i.test(val) || /^\/[A-Za-z0-9._\-\/]+$/.test(val),
    {
      message: 'Invalid URL. Use https://… or a site path starting with /',
    }
  );

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  image_url: urlOrPathSchema.optional().or(z.literal('')),
  printful_product_id: z.string().optional(),
  printful_variant_id: z.string().optional(),
  template_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      image_url: product?.image_url || '',
      printful_product_id: product?.printful_product_id || '',
      printful_variant_id: product?.printful_variant_id || '',
      template_url: product?.template_url || '',
      is_active: product?.is_active ?? true,
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-gray-600">
          {product ? 'Update product details' : 'Create a new product for your store'}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image_url">Product Image URL</Label>
              <Input
                id="image_url"
                {...form.register('image_url')}
                placeholder="https://example.com/image.jpg or /lovable-uploads/your-file.png"
              />
              {form.formState.errors.image_url && (
                <p className="text-sm text-red-600">{form.formState.errors.image_url.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active (visible in store)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Printful Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Printful Integration</CardTitle>
            <p className="text-sm text-gray-600">
              Link this product to your Printful catalog for automatic fulfillment
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="printful_product_id">Printful Product ID</Label>
              <Input
                id="printful_product_id"
                {...form.register('printful_product_id')}
                placeholder="e.g., 123456789"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your Printful dashboard under Products
              </p>
            </div>

            <div>
              <Label htmlFor="printful_variant_id">Printful Variant ID *</Label>
              <Input
                id="printful_variant_id"
                {...form.register('printful_variant_id')}
                placeholder="e.g., 987654321"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for automatic fulfillment. Find this in Printful under specific product variants.
              </p>
            </div>

            <div>
              <Label htmlFor="template_url">Design Template URL</Label>
              <Input
                id="template_url"
                {...form.register('template_url')}
                placeholder="https://printful.com/template/url"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Link to your design template in Printful
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
