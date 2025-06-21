
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import { Plus, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ItemMaintenanceTabProps {
  itemId: string;
  highlightTaskId?: string;
}

const ItemMaintenanceTab = ({ itemId, highlightTaskId }: ItemMaintenanceTabProps) => {
  const { tasks, updateTask } = useSupabaseMaintenance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const itemTasks = tasks.filter(task => task.item_id === itemId);
  
  // Properly categorize tasks
  const pendingTasks = itemTasks.filter(task => task.status === 'pending');
  const dueSoonTasks = itemTasks.filter(task => task.status === 'due_soon');
  const overdueTasks = itemTasks.filter(task => task.status === 'overdue');
  const inProgressTasks = itemTasks.filter(task => task.status === 'in_progress');
  const completedTasks = itemTasks.filter(task => task.status === 'completed');

  // All non-completed tasks for display
  const activeTasks = [...overdueTasks, ...dueSoonTasks, ...inProgressTasks, ...pendingTasks];

  // Debug logging
  useEffect(() => {
    console.log(`ItemMaintenanceTab - All tasks:`, tasks.length);
    console.log(`ItemMaintenanceTab - Tasks for item ${itemId}:`, itemTasks.length);
    console.log(`ItemMaintenanceTab - Item tasks:`, itemTasks);
    console.log(`ItemMaintenanceTab - Active tasks breakdown:`, {
      overdue: overdueTasks.length,
      dueSoon: dueSoonTasks.length,
      inProgress: inProgressTasks.length,
      pending: pendingTasks.length,
      completed: completedTasks.length
    });
  }, [tasks, itemTasks, itemId, overdueTasks.length, dueSoonTasks.length, inProgressTasks.length, pendingTasks.length, completedTasks.length]);

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'due_soon':
        return <Badge className="bg-yellow-500 text-white">Due Soon</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                        {getTaskIcon(task.status)}
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        {getStatusBadge(task.status)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
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
                      <Badge variant="secondary">Completed</Badge>
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
    </div>
  );
};

export default ItemMaintenanceTab;
