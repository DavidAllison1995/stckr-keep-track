
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import { Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface ItemMaintenanceTabProps {
  itemId: string;
  highlightTaskId?: string;
}

const ItemMaintenanceTab = ({ itemId, highlightTaskId }: ItemMaintenanceTabProps) => {
  const { tasks, updateTaskStatus } = useSupabaseMaintenance();
  const [showAddForm, setShowAddForm] = useState(false);

  const itemTasks = tasks.filter(task => task.item_id === itemId);
  const pendingTasks = itemTasks.filter(task => task.status === 'pending');
  const completedTasks = itemTasks.filter(task => task.status === 'completed');

  const handleTaskComplete = (taskId: string) => {
    updateTaskStatus(taskId, 'completed');
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

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Tasks ({pendingTasks.length})
          </h4>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`${highlightTaskId === task.id ? 'ring-2 ring-blue-500' : ''}`}
              >
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

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Completed Tasks ({completedTasks.length})
          </h4>
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map((task) => (
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
                          Completed: {new Date(task.date).toLocaleDateString()}
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
