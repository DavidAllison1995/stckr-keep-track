
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import RealtimeMetricsCards from '@/components/admin/analytics/RealtimeMetricsCards';
import UserGrowthChart from '@/components/admin/analytics/UserGrowthChart';
import OrderRevenueChart from '@/components/admin/analytics/OrderRevenueChart';
import QrClaimsChart from '@/components/admin/analytics/QrClaimsChart';

const AdminAnalyticsPage = () => {
  const { analytics, isLoading } = useAnalyticsData();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and performance metrics</p>
        </div>

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
