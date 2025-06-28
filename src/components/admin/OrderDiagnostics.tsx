
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OrderDiagnostics = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 RUNNING ORDER DIAGNOSTICS...');

      // Check recent orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          shipping_addresses (*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // Categorize orders
      const results = {
        totalOrders: orders?.length || 0,
        paidOrders: orders?.filter(o => o.status === 'paid').length || 0,
        processingOrders: orders?.filter(o => o.status === 'processing').length || 0,
        ordersWithPrintfulId: orders?.filter(o => o.printful_order_id).length || 0,
        ordersWithErrors: orders?.filter(o => o.fulfillment_error).length || 0,
        ordersWithoutShipping: orders?.filter(o => !o.shipping_addresses?.length).length || 0,
        recentOrders: orders?.slice(0, 5).map(order => ({
          id: order.id,
          email: order.user_email,
          status: order.status,
          total: order.total_amount,
          printfulId: order.printful_order_id,
          error: order.fulfillment_error,
          hasShipping: !!order.shipping_addresses?.length,
          itemCount: order.order_items?.length || 0,
          created: order.created_at
        })) || []
      };

      setDiagnostics(results);
      console.log('✅ DIAGNOSTICS COMPLETE:', results);

    } catch (error) {
      console.error('❌ DIAGNOSTICS ERROR:', error);
      toast({
        title: 'Diagnostics Failed',
        description: 'Failed to run order diagnostics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (!diagnostics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Running diagnostics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order Flow Diagnostics</h2>
        <Button onClick={runDiagnostics} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{diagnostics.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{diagnostics.ordersWithPrintfulId}</div>
            <div className="text-sm text-gray-600">Sent to Printful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{diagnostics.ordersWithErrors}</div>
            <div className="text-sm text-gray-600">With Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{diagnostics.ordersWithoutShipping}</div>
            <div className="text-sm text-gray-600">No Shipping</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {diagnostics.ordersWithErrors > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {diagnostics.ordersWithErrors} orders have fulfillment errors. Check the orders table below.
          </AlertDescription>
        </Alert>
      )}

      {diagnostics.ordersWithoutShipping > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {diagnostics.ordersWithoutShipping} orders are missing shipping addresses.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnostics.recentOrders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-sm">{order.id.slice(0, 8)}...</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{order.email}</div>
                    <div className="text-gray-500">£{order.total.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {order.printfulId ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">#{order.printfulId}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {order.error && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                    {!order.hasShipping && (
                      <Badge variant="secondary" className="text-xs">
                        No Shipping
                      </Badge>
                    )}
                  </div>
                </div>
                
                {order.error && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    {order.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDiagnostics;
