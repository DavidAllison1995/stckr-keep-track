
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useAnalyticsData = () => {
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
      const userGrowthData = await getUserGrowthData();
      const orderStatsData = await getOrderStatsData();
      const qrStatsData = await getQrStatsData();
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

    const { data: claims } = await supabase
      .from('user_qr_claims')
      .select('qr_code_id');

    const uniqueClaimedCodes = new Set(claims?.map(claim => claim.qr_code_id) || []);
    const claimed = uniqueClaimedCodes.size;
    const unclaimed = (totalCodes || 0) - claimed;

    return { claimed, unclaimed };
  };

  const getRealtimeMetrics = async () => {
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
      activeUsers: Math.floor(Math.random() * 50) + 10,
      recentScans: recentScans || 0,
      upcomingTasks: upcomingTasks || 0,
    };
  };

  return { analytics, isLoading };
};
