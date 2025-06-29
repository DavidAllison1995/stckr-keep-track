
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
  emptyStateMessage: string;
  emptyStateEmoji: string;
}

const TaskStatusPage = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  filterTasks, 
  emptyStateMessage, 
  emptyStateEmoji 
}: TaskStatusPageProps) => {
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
      <div className="min-h-screen bg-gray-950">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-gray-900 rounded-t-3xl shadow-lg min-h-screen border border-gray-800">
            <div className="p-6 pb-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading tasks...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-gray-900 rounded-t-3xl shadow-large min-h-screen border border-gray-800">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link to="/calendar">
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-600/20 border border-purple-500/30">
                  <Icon className={`w-6 h-6 text-purple-400`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  <p className="text-gray-400">{description} ({filteredTasks.length} tasks)</p>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 animate-pulse">
                      {emptyStateEmoji}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {emptyStateMessage}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {filteredTasks.length === 0 && title.includes('Up-to-Date') && "Great job staying on top of your maintenance!"}
                      {filteredTasks.length === 0 && title.includes('Due Soon') && "Check back soon to stay ahead of upcoming tasks."}
                      {filteredTasks.length === 0 && title.includes('Overdue') && "All your tasks are on track!"}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link to="/calendar">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-soft hover:shadow-md transition-all duration-200">
                          Back to Calendar
                        </Button>
                      </Link>
                      <Link to="/items">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500">
                          View All Items
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => {
                  const assignedItem = task.item_id ? getItemById(task.item_id) : null;
                  return (
                    <Card 
                      key={task.id} 
                      className="bg-gray-800 border-gray-700 hover:shadow-medium hover:border-purple-500/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleAddToCalendar(task, e)}
                              title="Add to Calendar"
                              className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all duration-200"
                            >
                              <CalendarPlus className="w-4 h-4 mr-1" />
                              Add to Calendar
                            </Button>
                            <Badge
                              variant="secondary"
                              className={`${getTaskStatusColor(task)} transition-all duration-200`}
                            >
                              {getTaskStatusLabel(task)}
                            </Badge>
                          </div>
                        </div>
                        
                        {task.notes && (
                          <p className="text-gray-300 mb-3">{task.notes}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                            {assignedItem && (
                              <span>Item: <span className="text-purple-400">{assignedItem.name}</span></span>
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
