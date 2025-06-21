
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import RealtimeMetricsCards from '@/components/admin/analytics/RealtimeMetricsCards';
import UserGrowthChart from '@/components/admin/analytics/UserGrowthChart';
import OrderRevenueChart from '@/components/admin/analytics/OrderRevenueChart';
import QrClaimsChart from '@/components/admin/analytics/QrClaimsChart';

const AdminAnalyticsPage = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const { analytics, isLoading, error, refetch } = useAnalyticsData();

  // Show loading while checking admin status
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error if not admin
  if (!isAdmin) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this page.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  const handleRefresh = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights and performance metrics</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Try refreshing the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}

        <RealtimeMetricsCards 
          metrics={analytics.realtimeMetrics} 
          isLoading={isLoading} 
        />

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="orders">Orders & Revenue</TabsTrigger>
            <TabsTrigger value="qr">QR Code Claims</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserGrowthChart data={analytics.userGrowth} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderRevenueChart data={analytics.orderStats} />
          </TabsContent>

          <TabsContent value="qr">
            <QrClaimsChart data={analytics.qrStats} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
