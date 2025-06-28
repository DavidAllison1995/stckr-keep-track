
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
  ExternalLink,
  RotateCcw,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  id: string;
  user_email: string;
  status: string;
  total_amount: number;
  printful_order_id: string | null;
  printful_status: string | null;
  printful_error: string | null;
  fulfillment_error: string | null;
  retry_count: number;
  customer_name: string | null;
  shipping_phone: string | null;
  created_at: string;
  stripe_session_id: string | null;
  order_items: any[];
  shipping_addresses: any[];
}

const OrderDiagnostics = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 LOADING ORDER DIAGNOSTICS...');

      // Load orders with full details
      const { data: ordersData, error: ordersError } = await supabase
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
        .limit(20);

      if (ordersError) throw ordersError;

      // Load webhook logs
      const { data: logsData, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) console.error('Error loading webhook logs:', logsError);

      // Calculate statistics
      const stats = {
        totalOrders: ordersData?.length || 0,
        paidOrders: ordersData?.filter(o => o.status === 'paid').length || 0,
        processingOrders: ordersData?.filter(o => o.status === 'processing').length || 0,
        printfulSuccess: ordersData?.filter(o => o.printful_order_id).length || 0,
        printfulErrors: ordersData?.filter(o => o.printful_error || o.fulfillment_error).length || 0,
        missingShipping: ordersData?.filter(o => !o.shipping_addresses?.length && o.status !== 'failed').length || 0,
        webhookEvents: logsData?.length || 0,
        failedWebhooks: logsData?.filter(l => l.processing_status === 'failed').length || 0,
      };

      setOrders(ordersData || []);
      setWebhookLogs(logsData || []);
      setStats(stats);

      console.log('✅ DIAGNOSTICS LOADED:', stats);

    } catch (error) {
      console.error('❌ DIAGNOSTICS ERROR:', error);
      toast({
        title: 'Error',
        description: 'Failed to load diagnostics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryPrintfulOrder = async (orderId: string) => {
    try {
      console.log('🔄 RETRYING PRINTFUL ORDER:', orderId);
      
      const { data, error } = await supabase.functions.invoke('printful-fulfillment', {
        body: { orderId }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Retry Initiated',
        description: 'Printful fulfillment retry has been started',
      });

      // Reload data to show updated status
      setTimeout(loadData, 2000);

    } catch (error) {
      console.error('❌ RETRY ERROR:', error);
      toast({
        title: 'Retry Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (order: OrderData) => {
    if (order.printful_error || order.fulfillment_error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    if (order.printful_order_id) {
      return <Badge variant="default">Printful: {order.printful_order_id}</Badge>;
    }
    
    if (order.status === 'processing') {
      return <Badge variant="secondary">Processing</Badge>;
    }
    
    if (order.status === 'paid') {
      return <Badge className="bg-green-600">Paid</Badge>;
    }
    
    return <Badge variant="outline">{order.status}</Badge>;
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading diagnostics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modern Shop Diagnostics</h2>
        <Button onClick={loadData} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.printfulSuccess}</div>
            <div className="text-sm text-gray-600">Printful Success</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.printfulErrors}</div>
            <div className="text-sm text-gray-600">Fulfillment Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.webhookEvents}</div>
            <div className="text-sm text-gray-600">Webhook Events</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.printfulErrors > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.printfulErrors} orders have fulfillment errors that need attention.
          </AlertDescription>
        </Alert>
      )}

      {stats.failedWebhooks > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.failedWebhooks} webhook events failed processing.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-sm">{order.id.slice(0, 8)}...</div>
                  <div className="flex gap-2">
                    {getStatusBadge(order)}
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{order.customer_name || order.user_email}</div>
                    <div className="text-gray-500">£{order.total_amount.toFixed(2)}</div>
                    {order.shipping_phone && (
                      <div className="text-gray-500">{order.shipping_phone}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Items: {order.order_items?.length || 0}</div>
                    <div className="text-gray-600">
                      Shipping: {order.shipping_addresses?.length ? '✅' : '❌'}
                    </div>
                    {order.stripe_session_id && (
                      <div className="text-gray-600 font-mono text-xs">
                        {order.stripe_session_id.slice(0, 20)}...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {(order.printful_error || order.fulfillment_error) && (
                      <div className="text-red-600 text-xs">
                        {order.printful_error || order.fulfillment_error}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {(order.printful_error || order.fulfillment_error) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => retryPrintfulOrder(order.id)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
                      
                      {order.stripe_session_id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/payments/${order.stripe_session_id}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Stripe
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Logs */}
      {webhookLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {log.processing_status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : log.processing_status === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="font-mono text-sm">{log.webhook_type}</span>
                    {log.stripe_session_id && (
                      <span className="text-xs text-gray-500">
                        {log.stripe_session_id.slice(0, 15)}...
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDiagnostics;
