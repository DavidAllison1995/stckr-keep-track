
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, Calendar } from 'lucide-react';

interface RealtimeMetrics {
  activeUsers: number;
  recentScans: number;
  upcomingTasks: number;
}

interface RealtimeMetricsCardsProps {
  metrics: RealtimeMetrics;
  isLoading: boolean;
}

const RealtimeMetricsCards = ({ metrics, isLoading }: RealtimeMetricsCardsProps) => {
  const realtimeCards = [
    {
      title: 'Active Users (24h)',
      value: metrics.activeUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Users with recent activity',
    },
    {
      title: 'QR Scans (24h)',
      value: metrics.recentScans,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Recent QR code scans',
    },
    {
      title: 'Upcoming Tasks',
      value: metrics.upcomingTasks,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Pending maintenance tasks',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {realtimeCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      metric.value.toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor} flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RealtimeMetricsCards;
