
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
    color: 'text-green-400 bg-green-900/30',
    borderColor: 'border-green-600/50',
    hoverColor: 'hover:bg-green-900/50 hover:border-green-500/70',
    route: '/tasks/up-to-date',
    description: 'Tasks due in 14+ days'
  }, {
    title: 'Due Soon',
    count: statusCounts.due_soon,
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-900/30',
    borderColor: 'border-yellow-600/50',
    hoverColor: 'hover:bg-yellow-900/50 hover:border-yellow-500/70',
    route: '/tasks/due-soon',
    description: 'Tasks due within 14 days'
  }, {
    title: 'Overdue',
    count: statusCounts.overdue,
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-900/30',
    borderColor: 'border-red-600/50',
    hoverColor: 'hover:bg-red-900/50 hover:border-red-500/70',
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
              <Card className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gray-900 border-gray-700 ${card.hoverColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full border ${card.color} ${card.borderColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-white">{card.title}</h3>
                        <p className="text-xs text-gray-400">{card.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{card.count}</div>
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
