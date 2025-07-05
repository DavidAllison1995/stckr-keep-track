
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import TaskEditDialog from '@/components/maintenance/TaskEditDialog';
import { Plus, Calendar, CheckCircle2, Clock, AlertTriangle, Trash2, Edit, CalendarPlus } from 'lucide-react';
import { calculateTaskStatus, getStatusLabel, getStatusColor, getStatusBorderColor } from '@/utils/taskStatus';
import { generateICSFile } from '@/utils/calendarExport';

interface ItemMaintenanceTabProps {
  itemId: string;
  highlightTaskId?: string;
}

const ItemMaintenanceTab = ({ itemId, highlightTaskId }: ItemMaintenanceTabProps) => {
  const { tasks, updateTask, deleteTask } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const itemTasks = tasks.filter(task => task.item_id === itemId);
  const item = getItemById(itemId);
  
  // Categorize tasks using centralized logic
  const activeTasks = itemTasks.filter(task => task.status !== 'completed');
  const completedTasks = itemTasks.filter(task => task.status === 'completed');

  // Debug logging
  useEffect(() => {
    console.log(`ItemMaintenanceTab - All tasks:`, tasks.length);
    console.log(`ItemMaintenanceTab - Tasks for item ${itemId}:`, itemTasks.length);
    console.log(`ItemMaintenanceTab - Item tasks:`, itemTasks);
    console.log(`ItemMaintenanceTab - Active vs completed breakdown:`, {
      active: activeTasks.length,
      completed: completedTasks.length
    });
  }, [tasks, itemTasks, itemId, activeTasks.length, completedTasks.length]);

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

  const handleAddToCalendar = (task: any) => {
    generateICSFile(task, item?.name);
  };

  const getTaskIcon = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'up_to_date':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    const label = getStatusLabel(status);
    const colorClass = getStatusColor(status);
    
    return <Badge className={`${colorClass} text-xs px-2 py-0.5 h-5 whitespace-nowrap`}>{label}</Badge>;
  };

  const getTaskStatusColorClass = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusColor(status);
  };

  const getTaskStatusBorderColorClass = (task: any) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusBorderColor(status);
  };

  if (showAddForm) {
    return (
      <div>
        <MaintenanceTaskForm
          itemId={itemId}
          onSuccess={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-white">Maintenance Tasks</h3>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Show Completed Tasks Toggle */}
      {completedTasks.length > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500"
          >
            {showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks'}
          </Button>
        </div>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Active Tasks ({activeTasks.length})
          </h4>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`bg-gray-800 border-gray-700 ${highlightTaskId === task.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getTaskIcon(task)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-medium text-white leading-tight ${
                              task.title.length > 20 ? 'text-sm md:text-base' : 'text-base'
                            } line-clamp-2`}>
                              {task.title}
                            </h5>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(task)}
                          </div>
                        </div>
                      {task.notes && (
                        <p className="text-sm text-gray-300 mt-1">{task.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Due: {new Date(task.date).toLocaleDateString()}
                        </span>
                        {task.recurrence !== 'none' && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {task.recurrence}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCalendar(task)}
                        title="Add to Calendar"
                        className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                      >
                        <CalendarPlus className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                        <span className="hidden sm:inline">Add to Calendar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id)}
                        className="border-gray-600 text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-500 text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                      >
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                        <span className="hidden sm:inline">Complete</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-500 px-2 h-8 md:h-9">
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Task</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete this maintenance task? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleTaskDelete(task.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Task
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks (conditionally shown) */}
      {showCompleted && completedTasks.length > 0 && (
        <>
          <Separator className="bg-gray-700" />
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Completed Tasks ({completedTasks.length})
            </h4>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id} className="bg-gray-800 border-gray-700 opacity-75">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{task.title}</h5>
                        {task.notes && (
                          <p className="text-sm text-gray-300 mt-1">{task.notes}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Completed: {new Date(task.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-600/50 text-xs px-2 py-0.5 h-5 whitespace-nowrap">Completed</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Completed Task</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete this completed maintenance task? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleTaskDelete(task.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Task
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {itemTasks.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h4 className="font-medium text-white mb-2">No maintenance tasks yet</h4>
          <p className="text-gray-400 mb-4">
            Add your first maintenance task to keep track of this item's upkeep.
          </p>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add First Task
          </Button>
        </div>
      )}

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ItemMaintenanceTab;
