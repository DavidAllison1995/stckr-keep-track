
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Activity, 
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number }>;
  orderStats: Array<{ month: string; orders: number; revenue: number }>;
  qrStats: { claimed: number; unclaimed: number };
  realtimeMetrics: {
    activeUsers: number;
    recentScans: number;
    upcomingTasks: number;
  };
}

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    orderStats: [],
    qrStats: { claimed: 0, unclaimed: 0 },
    realtimeMetrics: { activeUsers: 0, recentScans: 0, upcomingTasks: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Get user growth over time
      const userGrowthData = await getUserGrowthData();
      
      // Get order statistics
      const orderStatsData = await getOrderStatsData();
      
      // Get QR code claim statistics
      const qrStatsData = await getQrStatsData();
      
      // Get realtime metrics
      const realtimeData = await getRealtimeMetrics();

      setAnalytics({
        userGrowth: userGrowthData,
        orderStats: orderStatsData,
        qrStats: qrStatsData,
        realtimeMetrics: realtimeData,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserGrowthData = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at');

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    data?.forEach(profile => {
      const month = new Date(profile.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, users]) => ({ month, users }));
  };

  const getOrderStatsData = async () => {
    const { data } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .order('created_at');

    const monthlyData: { [key: string]: { orders: number; revenue: number } } = {};
    data?.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { orders: 0, revenue: 0 };
      }
      monthlyData[month].orders += 1;
      monthlyData[month].revenue += order.total_amount;
    });

    return Object.entries(monthlyData).map(([month, stats]) => ({ 
      month, 
      orders: stats.orders, 
      revenue: stats.revenue 
    }));
  };

  const getQrStatsData = async () => {
    const { count: totalCodes } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });

    const { count: claimedCodes } = await supabase
      .from('user_qr_claims')
      .select('qr_code_id', { count: 'exact', head: true });

    // Get unique claimed codes by fetching all claims and counting unique qr_code_ids
    const { data: claims } = await supabase
      .from('user_qr_claims')
      .select('qr_code_id');

    const uniqueClaimedCodes = new Set(claims?.map(claim => claim.qr_code_id) || []);
    const claimed = uniqueClaimedCodes.size;
    const unclaimed = (totalCodes || 0) - claimed;

    return { claimed, unclaimed };
  };

  const getRealtimeMetrics = async () => {
    // For demo purposes, return mock data
    // In a real app, you'd implement presence tracking and real queries
    
    const { count: recentScans } = await supabase
      .from('scan_history')
      .select('*', { count: 'exact', head: true })
      .gte('scanned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: upcomingTasks } = await supabase
      .from('maintenance_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('date', new Date().toISOString().split('T')[0]);

    return {
      activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
      recentScans: recentScans || 0,
      upcomingTasks: upcomingTasks || 0,
    };
  };

  const pieColors = ['#3b82f6', '#ef4444']; // Blue for claimed, red for unclaimed

  const pieData = [
    { name: 'Claimed', value: analytics.qrStats.claimed },
    { name: 'Unclaimed', value: analytics.qrStats.unclaimed },
  ];

  const realtimeCards = [
    {
      title: 'Active Users',
      value: analytics.realtimeMetrics.activeUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Scans (24h)',
      value: analytics.realtimeMetrics.recentScans,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Upcoming Tasks',
      value: analytics.realtimeMetrics.upcomingTasks,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and performance metrics</p>
        </div>

        {/* Realtime Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {realtimeCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : metric.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="orders">Orders & Revenue</TabsTrigger>
            <TabsTrigger value="qr">QR Code Claims</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Users Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Orders & Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.orderStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  QR Code Claims Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
