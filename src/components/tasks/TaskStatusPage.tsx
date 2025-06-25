
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { calculateTaskStatus, getStatusLabel, getStatusColor } from '@/utils/taskStatus';
import { generateICSFile } from '@/utils/calendarExport';

interface TaskStatusPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  filterTasks: (tasks: any[]) => any[];
}

const TaskStatusPage = ({ title, description, icon: Icon, color, filterTasks }: TaskStatusPageProps) => {
  const navigate = useNavigate();
  const { tasks, isLoading } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  console.log('TaskStatusPage - Raw tasks:', tasks?.length || 0);
  console.log('TaskStatusPage - Is loading:', isLoading);

  const filteredTasks = tasks ? filterTasks(tasks) : [];
  console.log('TaskStatusPage - Filtered tasks:', filteredTasks.length);

  const getTaskStatusColor = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusColor(status);
  };

  const getTaskStatusLabel = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusLabel(status);
  };

  const handleTaskClick = (task: any) => {
    if (task.item_id) {
      navigate(`/items/${task.item_id}?tab=tasks&highlight=${task.id}`);
    }
  };

  const handleAddToCalendar = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const assignedItem = task.item_id ? getItemById(task.item_id) : null;
    generateICSFile(task, assignedItem?.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
            <div className="p-6 pb-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading tasks...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <Icon className={`w-6 h-6 ${color}`} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600">{description} ({filteredTasks.length} tasks)</p>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleAddToCalendar(task, e)}
                              title="Add to Calendar"
                            >
                              <CalendarPlus className="w-4 h-4 mr-1" />
                              Add to Calendar
                            </Button>
                            <Badge
                              variant="secondary"
                              className={getTaskStatusColor(task)}
                            >
                              {getTaskStatusLabel(task)}
                            </Badge>
                          </div>
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

export default TaskStatusPage;
