import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import ManualFulfillmentButton from '@/components/admin/ManualFulfillmentButton';
import OrderDiagnostics from '@/components/admin/OrderDiagnostics';
import WebhookDiagnostics from '@/components/admin/WebhookDiagnostics';
import ValidatePrintfulVariant from '@/components/admin/ValidatePrintfulVariant';
import PrintfulCatalogBrowser from '@/components/admin/PrintfulCatalogBrowser';
import CreateSyncProductButton from '@/components/admin/CreateSyncProductButton';
import PrintableFileUpload from '@/components/admin/PrintableFileUpload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  image_url: string | null;
  printful_product_id: string | null;
  printful_variant_id: string | null;
  template_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  printful_order_id?: string | null;
  stripe_session_id?: string | null;
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
    };
  }[];
  fulfillment_error?: string | null;
}

const AdminShopPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTestingPrintful, setIsTestingPrintful] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, short_description, price, image_url, printful_product_id, printful_variant_id, template_url, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  const loadOrders = async () => {
    try {
      console.log('🔍 LOADING ALL ORDERS (including pending)...');
      
      // Load ALL orders, not just paid ones
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('📋 ALL ORDERS LOADED:', data?.length, 'orders');
      console.log('🕐 RECENT ORDERS:', data?.slice(0, 3));
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    }
  };

  const testPrintfulAPI = async () => {
    setIsTestingPrintful(true);
    try {
      console.log('🧪 TESTING PRINTFUL API...');
      
      const { data, error } = await supabase.functions.invoke('test-printful-api');
      
      if (error) {
        console.error('❌ PRINTFUL API TEST ERROR:', error);
        toast({
          title: 'Printful API Test Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ PRINTFUL API TEST RESULT:', data);
      
      if (data.success) {
        toast({
          title: 'Printful API Test Successful! ✅',
          description: `Store connected with ${data.productsCount} products available`,
        });
      } else {
        toast({
          title: 'Printful API Test Failed',
          description: data.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR testing Printful API:', error);
      toast({
        title: 'Test Error',
        description: 'Failed to test Printful API connection',
        variant: 'destructive',
      });
    } finally {
      setIsTestingPrintful(false);
    }
  };

  const handleProductSubmit = async (productData: any) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getProductIntegrationStatus = (product: Product) => {
    if (product.printful_variant_id) {
      return { status: 'connected', label: 'Printful Connected', color: 'green' };
    }
    return { status: 'not_connected', label: 'No Printful Link', color: 'yellow' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shop Management</h1>
            <p className="text-gray-600">Manage products and orders</p>
          </div>
          
          <div className="flex items-center gap-4">
            <CreateSyncProductButton onSuccess={loadProducts} />
            <Button
              onClick={testPrintfulAPI}
              disabled={isTestingPrintful}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTestingPrintful ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Test Printful API
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="printable">Printable Files</TabsTrigger>
            <TabsTrigger value="catalog">Browse Catalog</TabsTrigger>
            <TabsTrigger value="validation">Variant Validation</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Catalog
                </CardTitle>
                <Button onClick={() => {
                  setEditingProduct(null);
                  setShowProductDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Printful</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const integrationStatus = getProductIntegrationStatus(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.image_url ? (
                                <img 
                                  src={`${product.image_url}?v=${new Date(product.updated_at).getTime()}`} 
                                  alt={product.name}
                                  className="w-full h-full object-contain bg-gray-50"
                                  loading="lazy"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>£{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={integrationStatus.color === 'green' ? 'default' : 'secondary'}>
                              {integrationStatus.label}
                            </Badge>
                            {product.printful_variant_id && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {product.printful_variant_id}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(product.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  All Orders (Including Pending & Failed)
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Showing all orders regardless of payment status. Recent orders that show "pending" may indicate webhook processing issues.
                </p>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stripe ID</TableHead>
                        <TableHead>Printful</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{order.user_email}</TableCell>
                          <TableCell>£{order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.stripe_session_id ? (
                              <Badge variant="default" className="text-xs">
                                {order.stripe_session_id.slice(0, 8)}...
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                No Stripe ID
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.printful_order_id ? (
                              <Badge variant="default" className="text-xs">
                                #{order.printful_order_id}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Not sent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.fulfillment_error && (
                              <Badge variant="destructive" className="text-xs">
                                Error
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <ManualFulfillmentButton
                                orderId={order.id}
                                orderStatus={order.status}
                                printfulOrderId={order.printful_order_id}
                                onSuccess={loadOrders}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printable" className="space-y-6">
            <PrintableFileUpload />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <PrintfulCatalogBrowser />
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <ValidatePrintfulVariant />
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6">
            <OrderDiagnostics />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookDiagnostics />
          </TabsContent>
        </Tabs>

        {/* Product Form Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onSubmit={handleProductSubmit}
              onCancel={() => setShowProductDialog(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminShopPage;
