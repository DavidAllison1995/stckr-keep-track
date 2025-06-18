
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Package } from 'lucide-react';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';

const TasksPage = () => {
  const { status } = useParams<{ status: string }>();
  const navigate = useNavigate();
  const { getTasksByStatus } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return {
          title: 'Up-to-Date Tasks',
          description: 'Tasks due in 14+ days',
          color: 'text-green-800 bg-green-100',
          tasks: getTasksByStatus('pending').filter(task => {
            const taskDate = new Date(task.date);
            const now = new Date();
            const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            return taskDate > fourteenDaysFromNow;
          })
        };
      case 'due-soon':
        return {
          title: 'Due Soon Tasks',
          description: 'Tasks due within 14 days',
          color: 'text-yellow-800 bg-yellow-100',
          tasks: getTasksByStatus('due_soon')
        };
      case 'overdue':
        return {
          title: 'Overdue Tasks',
          description: 'Tasks past due date',
          color: 'text-red-800 bg-red-100',
          tasks: getTasksByStatus('overdue')
        };
      default:
        return {
          title: 'Tasks',
          description: 'All tasks',
          color: 'text-gray-800 bg-gray-100',
          tasks: []
        };
    }
  };

  const statusInfo = getStatusInfo(status || '');
  const sortedTasks = statusInfo.tasks.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleItemClick = (itemId: string, taskId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'maintenance');
    params.set('highlight', taskId);
    navigate(`/items/${itemId}?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString: string) => {
    const now = new Date();
    const due = new Date(dateString);
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Calendar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{statusInfo.title}</h1>
                <p className="text-gray-600">{statusInfo.description}</p>
              </div>
            </div>

            {/* Tasks List */}
            {sortedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600">
                    No tasks match this status category.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedTasks.map((task) => {
                  const assignedItem = task.item_id ? getItemById(task.item_id) : null;
                  const daysUntilDue = getDaysUntilDue(task.date);
                  
                  return (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => task.item_id && handleItemClick(task.item_id, task.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{task.title}</h3>
                              <Badge className={statusInfo.color}>
                                {status?.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            {task.notes && (
                              <p className="text-gray-600 mb-3">{task.notes}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {formatDate(task.date)}</span>
                                {daysUntilDue < 0 && (
                                  <span className="text-red-600 font-medium">
                                    ({Math.abs(daysUntilDue)} days overdue)
                                  </span>
                                )}
                                {daysUntilDue >= 0 && daysUntilDue <= 14 && (
                                  <span className="text-yellow-600 font-medium">
                                    ({daysUntilDue} days remaining)
                                  </span>
                                )}
                              </div>
                              
                              {assignedItem && (
                                <div className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  <span 
                                    className="text-blue-600 hover:underline cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemClick(task.item_id!, task.id);
                                    }}
                                  >
                                    {assignedItem.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
