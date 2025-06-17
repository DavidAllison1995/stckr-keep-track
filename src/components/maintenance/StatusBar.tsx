import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useNavigate } from 'react-router-dom';
const StatusBar = () => {
  const {
    getTasksByStatus
  } = useMaintenance();
  const navigate = useNavigate();
  const upToDateTasks = getTasksByStatus('up_to_date');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const overdueTasks = getTasksByStatus('overdue');
  const statusCards = [{
    title: 'Up-to-Date',
    count: upToDateTasks.length,
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    route: '/tasks/up-to-date',
    description: 'Tasks due in 14+ days'
  }, {
    title: 'Due Soon',
    count: dueSoonTasks.length,
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    route: '/tasks/due-soon',
    description: 'Tasks due within 14 days'
  }, {
    title: 'Overdue',
    count: overdueTasks.length,
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-100',
    route: '/tasks/overdue',
    description: 'Tasks past due date'
  }];
  const handleCardClick = (route: string) => {
    navigate(route);
  };
  return <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map(card => {
        const IconComponent = card.icon;
        return <Card key={card.title} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105" onClick={() => handleCardClick(card.route)} role="button" aria-label={`Show all ${card.title.toLowerCase()} tasks`}>
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
            </Card>;
      })}
      </div>
    </div>;
};
export default StatusBar;