import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import TaskEditDialog from '@/components/maintenance/TaskEditDialog';
import { Plus, Calendar, CheckCircle2, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { calculateTaskStatus, getStatusLabel, getStatusColor, getStatusBorderColor } from '@/utils/taskStatus';

interface ItemMaintenanceTabProps {
  itemId: string;
  highlightTaskId?: string;
}

const ItemMaintenanceTab = ({ itemId, highlightTaskId }: ItemMaintenanceTabProps) => {
  const { tasks, updateTask, deleteTask } = useSupabaseMaintenance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const itemTasks = tasks.filter(task => task.item_id === itemId);
  
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
    
    return <Badge className={colorClass}>{label}</Badge>;
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
        <h3 className="font-semibold text-lg">Maintenance Tasks</h3>
        <Button onClick={() => setShowAddForm(true)}>
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
          >
            {showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks'}
          </Button>
        </div>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Active Tasks ({activeTasks.length})
          </h4>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`${highlightTaskId === task.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTaskIcon(task)}
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        {getStatusBadge(task)}
                      </div>
                      {task.notes && (
                        <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Due: {new Date(task.date).toLocaleDateString()}
                        </span>
                        {task.recurrence !== 'none' && (
                          <Badge variant="outline" className="text-xs">
                            {task.recurrence}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this maintenance task? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
          <Separator />
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completed Tasks ({completedTasks.length})
            </h4>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Completed: {new Date(task.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Completed</Badge>
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
          <h4 className="font-medium text-gray-900 mb-2">No maintenance tasks yet</h4>
          <p className="text-gray-600 mb-4">
            Add your first maintenance task to keep track of this item's upkeep.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
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
