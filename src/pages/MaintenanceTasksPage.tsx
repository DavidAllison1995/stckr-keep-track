
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MaintenanceTasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  // Determine filter based on current path
  const getFilterFromPath = () => {
    if (location.pathname.includes('/up-to-date')) return 'pending';
    if (location.pathname.includes('/due-soon')) return 'due_soon';
    if (location.pathname.includes('/overdue')) return 'overdue';
    if (location.pathname.includes('/completed')) return 'completed';
    return 'all';
  };

  const filter = getFilterFromPath();
  
  const filteredTasks = filter === 'all' 
    ? tasks.filter(task => task.status !== 'completed')
    : tasks.filter(task => task.status === filter);

  const getStatusInfo = () => {
    switch (filter) {
      case 'pending':
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
      case 'completed':
        return {
          title: 'Completed Tasks',
          description: 'Tasks that have been completed',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      default:
        return {
          title: 'All Active Tasks',
          description: 'Overview of all active tasks',
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
      case 'pending': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue': return 'Overdue';
      case 'due_soon': return 'Due Soon';
      case 'pending': return 'Up to Date';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleTaskClick = (task: any) => {
    if (task.item_id) {
      navigate(`/items/${task.item_id}?tab=maintenance&highlight=${task.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link to="/maintenance">
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
                  const assignedItem = task.item_id ? getItemById(task.item_id) : null;
                  return (
                    <Card 
                      key={task.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(task.status)}
                          >
                            {getStatusLabel(task.status)}
                          </Badge>
                        </div>
                        
                        {task.notes && (
                          <p className="text-gray-600 mb-3">{task.notes}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>
                              {task.status === 'completed' 
                                ? `Completed: ${new Date(task.updated_at).toLocaleDateString()}`
                                : `Due: ${new Date(task.date).toLocaleDateString()}`
                              }
                            </span>
                            {assignedItem && (
                              <span>Item: {assignedItem.name}</span>
                            )}
                          </div>
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
