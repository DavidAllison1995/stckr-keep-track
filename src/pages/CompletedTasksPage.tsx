
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { ArrowLeft, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const CompletedTasksPage = () => {
  const navigate = useNavigate();
  const { tasks, deleteTask } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleTaskClick = (task: any) => {
    if (task.item_id) {
      navigate(`/items/${task.item_id}?tab=maintenance&highlight=${task.id}`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
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
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Completed Tasks</h1>
                  <p className="text-gray-600">Tasks that have been completed</p>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No completed tasks found</p>
                  </CardContent>
                </Card>
              ) : (
                completedTasks.map((task) => {
                  const assignedItem = task.item_id ? getItemById(task.item_id) : null;
                  return (
                    <Card 
                      key={task.id} 
                      className="hover:shadow-md transition-shadow opacity-75"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                          >
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Completed Task</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this completed maintenance task? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Task
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        {task.notes && (
                          <p className="text-sm text-gray-600 mb-3">{task.notes}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>Completed: {new Date(task.updated_at).toLocaleDateString()}</span>
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

export default CompletedTasksPage;
