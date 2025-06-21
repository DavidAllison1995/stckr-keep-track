
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  ShoppingCart, 
  QrCode, 
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  activeQrCodes: number;
  totalClaims: number;
}

const AdminDashboardPage = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    activeQrCodes: 0,
    totalClaims: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadDashboardStats();
    }
  }, [authLoading, isAdmin]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading dashboard stats...');

      // Use Promise.allSettled to handle partial failures gracefully
      const [usersResult, ordersResult, qrCodesResult, claimsResult] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('qr_codes').select('*', { count: 'exact', head: true }),
        supabase.from('user_qr_claims').select('*', { count: 'exact', head: true })
      ]);

      const newStats = {
        totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
        totalOrders: ordersResult.status === 'fulfilled' ? (ordersResult.value.count || 0) : 0,
        activeQrCodes: qrCodesResult.status === 'fulfilled' ? (qrCodesResult.value.count || 0) : 0,
        totalClaims: claimsResult.status === 'fulfilled' ? (claimsResult.value.count || 0) : 0,
      };

      setStats(newStats);
      console.log('Dashboard stats loaded:', newStats);

      // Log any errors but don't fail completely
      [usersResult, ordersResult, qrCodesResult, claimsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Stat query ${index} failed:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardStats();
  };

  // Show loading while checking admin status
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error if not admin (should be handled by AdminProtectedRoute, but extra safety)
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sticker Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'QR Codes',
      value: stats.activeQrCodes,
      icon: QrCode,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Claims',
      value: stats.totalClaims,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickLinks = [
    {
      title: 'QR Code Management',
      description: 'Generate and manage master QR codes',
      href: '/admin/qr',
      icon: QrCode,
      color: 'text-blue-600',
    },
    {
      title: 'Shop Management',
      description: 'Manage products and orders',
      href: '/admin/shop',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Analytics',
      description: 'View charts and insights',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of your platform's performance</p>
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : (
                          stat.value.toLocaleString()
                        )}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card key={link.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${link.color}`} />
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4">{link.description}</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={link.href} className="flex items-center justify-center gap-2">
                        Go to {link.title}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
