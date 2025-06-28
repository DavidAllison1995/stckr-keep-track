
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Eye, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PrintfulCatalogBrowser = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [catalogData, setCatalogData] = useState<any>(null);

  const browseCatalog = async (productId?: string) => {
    setIsLoading(true);
    setCatalogData(null);

    try {
      console.log('🔍 BROWSING PRINTFUL CATALOG...', { productId, searchTerm });
      
      const { data, error } = await supabase.functions.invoke('browse-printful-catalog', {
        body: { 
          productId: productId || null,
          search: searchTerm || null
        }
      });

      if (error) {
        console.error('❌ CATALOG BROWSE ERROR:', error);
        toast({
          title: 'Catalog Browse Error',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ CATALOG DATA:', data);
      setCatalogData(data);
      
      if (data?.success) {
        if (productId) {
          toast({
            title: 'Product Variants Loaded! ✅',
            description: `Found ${data.variants?.length || 0} variants`,
          });
        } else {
          toast({
            title: 'Catalog Loaded! ✅',
            description: `Found ${data.count || 0} products`,
          });
        }
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR:', error);
      toast({
        title: 'Browse Error',
        description: 'Failed to browse Printful catalog',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyVariantId = (variantId: string) => {
    navigator.clipboard.writeText(variantId);
    toast({
      title: 'Copied! 📋',
      description: `Variant ID ${variantId} copied to clipboard`,
    });
  };

  // Helper function to get availability status as string
  const getAvailabilityStatus = (variant: any) => {
    if (variant.availability_status && Array.isArray(variant.availability_status)) {
      // Check if any region has 'in_stock' status
      const inStockRegions = variant.availability_status.filter((status: any) => status.status === 'in_stock');
      return inStockRegions.length > 0 ? 'in_stock' : 'out_of_stock';
    }
    return 'unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Browse Printful Catalog
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products (e.g., 'sticker', 'shirt')"
            className="flex-1"
          />
          <Button
            onClick={() => browseCatalog()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Browse Products
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Enter Product ID to see variants (e.g., 505)"
            className="flex-1"
          />
          <Button
            onClick={() => browseCatalog(selectedProductId)}
            disabled={isLoading || !selectedProductId}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Get Variants
          </Button>
        </div>

        {catalogData && (
          <div className="space-y-4">
            {catalogData.products && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Products ({catalogData.count})</h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {catalogData.products.map((product: any) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{product.title}</h5>
                          <p className="text-sm text-gray-600">ID: {product.id}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProductId(product.id.toString());
                            browseCatalog(product.id.toString());
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Variants
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {catalogData.variants && (
              <div>
                <h4 className="font-semibold text-lg mb-3">
                  Variants for {catalogData.product?.title} ({catalogData.variants.length})
                </h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {catalogData.variants.map((variant: any) => {
                    const availabilityStatus = getAvailabilityStatus(variant);
                    return (
                      <div key={variant.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{variant.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">ID: {variant.id}</Badge>
                              <Badge variant="secondary">{variant.currency} {variant.price}</Badge>
                              <Badge variant={availabilityStatus === 'in_stock' ? 'default' : 'destructive'}>
                                {availabilityStatus.replace('_', ' ')}
                              </Badge>
                            </div>
                            {variant.color && <p className="text-xs text-gray-500 mt-1">Color: {variant.color}</p>}
                            {variant.size && <p className="text-xs text-gray-500">Size: {variant.size}</p>}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyVariantId(variant.id.toString())}
                            className="flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy ID
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintfulCatalogBrowser;
