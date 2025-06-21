
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBar = () => {
  const { tasks } = useSupabaseMaintenance();

  // Filter tasks by status (excluding completed tasks from active counts)
  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const pendingTasks = activeTasks.filter(task => task.status === 'pending');
  const dueSoonTasks = activeTasks.filter(task => task.status === 'due_soon');
  const overdueTasks = activeTasks.filter(task => task.status === 'overdue');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const statusItems = [
    {
      label: 'Up to Date',
      count: pendingTasks.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/tasks/up-to-date'
    },
    {
      label: 'Due Soon',
      count: dueSoonTasks.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/tasks/due-soon'
    },
    {
      label: 'Overdue',
      count: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/tasks/overdue'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            {statusItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.link}>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${item.bgColor} hover:opacity-80 transition-opacity cursor-pointer`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {completedTasks.length > 0 && (
            <Link to="/tasks/completed">
              <Button variant="outline" size="sm" className="text-gray-600">
                <Eye className="w-4 h-4 mr-2" />
                View Completed ({completedTasks.length})
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusBar;
