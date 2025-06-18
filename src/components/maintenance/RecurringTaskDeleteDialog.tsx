
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/useMaintenance';

interface RecurringTaskDeleteDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
}

const RecurringTaskDeleteDialog = ({
  task,
  open,
  onOpenChange,
  onDeleteSingle,
  onDeleteAll
}: RecurringTaskDeleteDialogProps) => {
  const isRecurring = task && (task.recurrence !== 'none' || task.parentTaskId);
  const recurrenceText = task?.recurrence && task.recurrence !== 'none' 
    ? task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)
    : 'Unknown';

  if (!isRecurring) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Delete Recurring Task
          </DialogTitle>
          <DialogDescription className="text-left">
            This task repeats <strong>{recurrenceText.toLowerCase()}</strong>. 
            Do you want to delete only this occurrence, or all future occurrences?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-sm mb-1">{task?.title}</h4>
            <p className="text-sm text-gray-600">
              Scheduled: {task && new Date(task.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              onDeleteSingle();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Delete Only This
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onDeleteAll();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Delete All Occurrences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringTaskDeleteDialog;
