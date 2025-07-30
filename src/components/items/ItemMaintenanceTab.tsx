
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
import { generateICSFile, addToNativeCalendar } from '@/utils/calendarExport';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItemMaintenanceTabProps {
  itemId: string;
  highlightTaskId?: string;
}

const ItemMaintenanceTab = ({ itemId, highlightTaskId }: ItemMaintenanceTabProps) => {
  const { tasks, updateTask, deleteTask } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();
  const isMobile = useIsMobile();
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
    if (isMobile) {
      addToNativeCalendar(task, item?.name);
    } else {
      generateICSFile(task, item?.name);
    }
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
      {/* Header with better styling */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-xl text-white mb-1">Maintenance Tasks</h3>
          <p className="text-sm text-gray-400">
            {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''} 
            {completedTasks.length > 0 && `, ${completedTasks.length} completed`}
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Show Completed Tasks Toggle - Better positioning */}
      {completedTasks.length > 0 && (
        <div className="flex justify-center sm:justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200"
          >
            {showCompleted ? 'Hide' : 'Show'} Completed Tasks ({completedTasks.length})
          </Button>
        </div>
      )}

      {/* Active Tasks with improved design */}
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
            <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center border border-purple-600/50">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="font-semibold text-lg text-white">
              Active Tasks
            </h4>
            <Badge className="bg-purple-900/50 text-purple-300 border-purple-600/50">
              {activeTasks.length}
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {activeTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`
                  bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 
                  transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10
                  ${highlightTaskId === task.id ? 'ring-2 ring-purple-500 border-purple-500' : ''}
                `}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {getTaskIcon(task)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-lg text-white leading-tight mb-1">
                            {task.title}
                          </h5>
                          {task.notes && (
                            <p className="text-sm text-gray-300 leading-relaxed">{task.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(task)}
                      </div>
                    </div>
                    
                    {/* Task Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                      </div>
                      {task.recurrence !== 'none' && (
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          Repeats {task.recurrence}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action Buttons - Redesigned to be more obvious */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCalendar(task)}
                        className="
                          border-blue-600/50 text-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 
                          transition-all duration-200 font-medium flex-1 sm:flex-none
                        "
                      >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="
                          border-purple-600/50 text-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 
                          transition-all duration-200 font-medium flex-1 sm:flex-none
                        "
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id)}
                        className="
                          border-green-600/50 text-green-300 hover:bg-green-600 hover:text-white hover:border-green-500 
                          transition-all duration-200 font-medium flex-1 sm:flex-none
                        "
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="
                              border-red-600/50 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-500 
                              transition-all duration-200 font-medium
                            "
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Task</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete "{task.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleTaskDelete(task.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
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

      {/* Completed Tasks with improved design */}
      {showCompleted && completedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
            <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center border border-green-600/50">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <h4 className="font-semibold text-lg text-white">
              Completed Tasks
            </h4>
            <Badge className="bg-green-900/50 text-green-300 border-green-600/50">
              {completedTasks.length}
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {completedTasks.map((task) => (
              <Card key={task.id} className="bg-gray-800/30 border-gray-700 opacity-75 hover:opacity-90 transition-opacity">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-lg text-white leading-tight mb-1">
                            {task.title}
                          </h5>
                          {task.notes && (
                            <p className="text-sm text-gray-300 leading-relaxed">{task.notes}</p>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-900/50 text-green-300 border-green-600/50">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed: {new Date(task.updated_at).toLocaleDateString()}</span>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-600/50 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Completed Task</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete "{task.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                              Cancel
                            </AlertDialogCancel>
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

      {/* Empty State - Improved design */}
      {itemTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-600/50">
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <h4 className="font-semibold text-xl text-white mb-2">No maintenance tasks yet</h4>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Keep your {item?.name || 'item'} in perfect condition by adding maintenance tasks and reminders.
          </p>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Task
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
