
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { Link } from 'react-router-dom';
import { getTaskStatusCounts } from '@/utils/taskStatus';

const StatusBar = () => {
  const { tasks } = useSupabaseMaintenance();

  // Calculate task statuses using centralized logic
  const statusCounts = getTaskStatusCounts(tasks.filter(task => task.status !== 'completed'));

  const statusCards = [{
    title: 'Up-to-Date',
    count: statusCounts.up_to_date,
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    route: '/tasks/up-to-date',
    description: 'Tasks due in 14+ days'
  }, {
    title: 'Due Soon',
    count: statusCounts.due_soon,
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    route: '/tasks/due-soon',
    description: 'Tasks due within 14 days'
  }, {
    title: 'Overdue',
    count: statusCounts.overdue,
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-100',
    route: '/tasks/overdue',
    description: 'Tasks past due date'
  }];

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map(card => {
          const IconComponent = card.icon;
          return (
            <Link key={card.title} to={card.route}>
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${card.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-700">{card.title}</h3>
                        <p className="text-xs text-gray-500">{card.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{card.count}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StatusBar;
