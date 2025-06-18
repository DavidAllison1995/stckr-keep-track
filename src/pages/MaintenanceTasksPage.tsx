
import { useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';
import { ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MaintenanceTasksPage = () => {
  const location = useLocation();
  const { tasks } = useMaintenance();
  const { getItemById } = useItems();

  // Determine filter based on current path
  const getFilterFromPath = () => {
    if (location.pathname.includes('/up-to-date')) return 'up_to_date';
    if (location.pathname.includes('/due-soon')) return 'due_soon';
    if (location.pathname.includes('/overdue')) return 'overdue';
    return 'all';
  };

  const filter = getFilterFromPath();
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const getStatusInfo = () => {
    switch (filter) {
      case 'up_to_date':
        return {
          title: 'Up-to-Date Tasks',
          description: 'Tasks due in 14+ days',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'due_soon':
        return {
          title: 'Due Soon Tasks',
          description: 'Tasks due within 14 days',
          icon: Clock,
          color: 'text-yellow-600'
        };
      case 'overdue':
        return {
          title: 'Overdue Tasks',
          description: 'Tasks past due date',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      default:
        return {
          title: 'All Maintenance Tasks',
          description: 'Overview of all tasks',
          icon: Calendar,
          color: 'text-blue-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'up_to_date': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link to="/calendar">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{statusInfo.title}</h1>
                  <p className="text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <StatusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tasks found for this category</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => {
                  const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(task.status)}
                          >
                            {task.status === 'overdue' ? 'Overdue' :
                             task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                          </Badge>
                        </div>
                        
                        {task.notes && (
                          <p className="text-gray-600 mb-3">{task.notes}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                            {assignedItem && (
                              <span>Item: {assignedItem.name}</span>
                            )}
                          </div>
                          <span className="capitalize">
                            {task.recurrence !== 'none' ? `Repeats ${task.recurrence}` : 'One-time'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTasksPage;
