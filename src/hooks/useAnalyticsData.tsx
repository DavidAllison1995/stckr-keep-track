
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setError(null);
      console.log('Loading analytics data...');
      
      const [userGrowthData, orderStatsData, qrStatsData, realtimeData] = await Promise.allSettled([
        getUserGrowthData(),
        getOrderStatsData(),
        getQrStatsData(),
        getRealtimeMetrics(),
      ]);

      setAnalytics({
        userGrowth: userGrowthData.status === 'fulfilled' ? userGrowthData.value : [],
        orderStats: orderStatsData.status === 'fulfilled' ? orderStatsData.value : [],
        qrStats: qrStatsData.status === 'fulfilled' ? qrStatsData.value : { claimed: 0, unclaimed: 0 },
        realtimeMetrics: realtimeData.status === 'fulfilled' ? realtimeData.value : { activeUsers: 0, recentScans: 0, upcomingTasks: 0 },
      });

      // Log any failed promises
      [userGrowthData, orderStatsData, qrStatsData, realtimeData].forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Analytics data fetch ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserGrowthData = async () => {
    console.log('Fetching user growth data...');
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at');

    if (error) {
      console.error('Error fetching user growth data:', error);
      throw error;
    }

    const monthlyData: { [key: string]: number } = {};
    data?.forEach(profile => {
      const month = new Date(profile.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const result = Object.entries(monthlyData).map(([month, users]) => ({ month, users }));
    console.log('User growth data:', result);
    return result;
  };

  const getOrderStatsData = async () => {
    console.log('Fetching order stats data...');
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .order('created_at');

    if (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }

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
      monthlyData[month].revenue += Number(order.total_amount);
    });

    const result = Object.entries(monthlyData).map(([month, stats]) => ({ 
      month, 
      orders: stats.orders, 
      revenue: stats.revenue 
    }));
    console.log('Order stats data:', result);
    return result;
  };

  const getQrStatsData = async () => {
    console.log('Fetching QR stats data...');
    const { count: totalCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });

    if (qrError) {
      console.error('Error fetching QR codes count:', qrError);
      throw qrError;
    }

    const { data: claims, error: claimsError } = await supabase
      .from('user_qr_claims')
      .select('qr_code_id');

    if (claimsError) {
      console.error('Error fetching QR claims:', claimsError);
      throw claimsError;
    }

    const uniqueClaimedCodes = new Set(claims?.map(claim => claim.qr_code_id) || []);
    const claimed = uniqueClaimedCodes.size;
    const unclaimed = (totalCodes || 0) - claimed;

    const result = { claimed, unclaimed };
    console.log('QR stats data:', result);
    return result;
  };

  const getRealtimeMetrics = async () => {
    console.log('Fetching realtime metrics...');
    
    // Get users who have been active in the last 24 hours (based on scan history or task updates)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const [scanHistoryResult, taskUpdatesResult, upcomingTasksResult] = await Promise.allSettled([
      // Recent scans in last 24 hours
      supabase
        .from('scan_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('scanned_at', oneDayAgo),
      
      // Users who updated tasks in last 24 hours
      supabase
        .from('maintenance_tasks')
        .select('user_id')
        .gte('updated_at', oneDayAgo),
      
      // Upcoming tasks
      supabase
        .from('maintenance_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('date', new Date().toISOString().split('T')[0])
    ]);

    let activeUsers = 0;
    let recentScans = 0;
    let upcomingTasks = 0;

    // Calculate active users from scan history and task updates
    if (scanHistoryResult.status === 'fulfilled') {
      recentScans = scanHistoryResult.value.count || 0;
    } else {
      console.error('Error fetching scan history:', scanHistoryResult.reason);
    }

    if (taskUpdatesResult.status === 'fulfilled') {
      const taskUsers = new Set(taskUpdatesResult.value.data?.map(task => task.user_id) || []);
      activeUsers = taskUsers.size;
    } else {
      console.error('Error fetching task updates:', taskUpdatesResult.reason);
    }

    if (upcomingTasksResult.status === 'fulfilled') {
      upcomingTasks = upcomingTasksResult.value.count || 0;
    } else {
      console.error('Error fetching upcoming tasks:', upcomingTasksResult.reason);
    }

    // If we don't have any active users from tasks, try to get a more general count
    if (activeUsers === 0) {
      try {
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('id')
          .gte('updated_at', oneDayAgo);
        
        activeUsers = recentProfiles?.length || 0;
      } catch (error) {
        console.error('Error fetching recent profiles:', error);
        // Fallback to a reasonable estimate if all else fails
        activeUsers = Math.max(1, Math.floor(recentScans / 3));
      }
    }

    const result = {
      activeUsers,
      recentScans,
      upcomingTasks,
    };
    console.log('Realtime metrics:', result);
    return result;
  };

  return { analytics, isLoading, error, refetch: loadAnalyticsData };
};
