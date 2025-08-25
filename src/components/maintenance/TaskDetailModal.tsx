import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, FileText, ExternalLink, CheckCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { calculateTaskStatus } from '@/utils/taskStatus';
import { getStatusColor, getStatusBorderColor } from '@/utils/taskStatus';
import TaskEditDialog from './TaskEditDialog';

interface TaskDetailModalProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const TaskDetailModal = ({ task, open, onOpenChange, onNavigateToItem }: TaskDetailModalProps) => {
  const { markTaskComplete } = useSupabaseMaintenance();
  const { items } = useSupabaseItems();
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!task) return null;

  const associatedItem = items?.find(item => item.id === task.item_id);
  const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
  const statusColor = getStatusColor(status);
  const statusBorderColor = getStatusBorderColor(status);

  const handleMarkComplete = async () => {
    if (task.status !== 'completed') {
      await markTaskComplete(task.id);
      onOpenChange(false);
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleViewItem = () => {
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
      onOpenChange(false);
    }
  };

  const formatRecurrence = (recurrence: string) => {
    if (!recurrence || recurrence === 'none') return 'One-time';
    return recurrence.charAt(0).toUpperCase() + recurrence.slice(1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg font-semibold leading-tight">
              {task.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${statusColor} ${statusBorderColor} capitalize`}
              >
                {status.replace('_', ' ')}
              </Badge>
              {task.recurrence && task.recurrence !== 'none' && (
                <Badge variant="secondary" className="text-xs">
                  {formatRecurrence(task.recurrence)}
                </Badge>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Due: {format(new Date(task.date), 'MMM dd, yyyy')}</span>
            </div>

            {/* Associated Item */}
            {associatedItem && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 flex items-center justify-center">
                  {associatedItem.icon_id ? (
                    <span className="text-base">{associatedItem.icon_id}</span>
                  ) : (
                    <div className="w-3 h-3 bg-muted rounded-sm" />
                  )}
                </div>
                <span>{associatedItem.name}</span>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 p-3 rounded-md">
                  {task.notes}
                </p>
              </div>
            )}

            {/* Completion Info */}
            {task.status === 'completed' && task.completed_at && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Completed on {format(new Date(task.completed_at), 'MMM dd, yyyy')}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {task.status !== 'completed' && (
                <Button 
                  onClick={handleMarkComplete}
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleEdit}
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                {associatedItem && (
                  <Button 
                    variant="outline" 
                    onClick={handleViewItem}
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Item
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <TaskEditDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          setShowEditDialog(false);
          onOpenChange(false);
        }}
      />
    </>
  );
};

export default TaskDetailModal;