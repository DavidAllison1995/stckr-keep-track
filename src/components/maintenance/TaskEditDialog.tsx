
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useToast } from '@/hooks/use-toast';

interface TaskEditDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TaskEditDialog = ({ task, open, onOpenChange, onSuccess }: TaskEditDialogProps) => {
  const { updateTask } = useSupabaseMaintenance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    date: '',
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        notes: task.notes || '',
        date: task.date,
      });
    }
  }, [task]);

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      date: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !formData.title.trim() || !formData.date) {
      return;
    }

    try {
      await updateTask(task.id, {
        title: formData.title.trim(),
        notes: formData.notes || null,
        date: formData.date,
        recurrence: task.recurrence, // Keep existing recurrence value
      });

      toast({
        title: "Task updated",
        description: "The maintenance task has been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (task) {
      setFormData({
        title: task.title,
        notes: task.notes || '',
        date: task.date,
      });
    }
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Change air filter"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Due Date *</Label>
            <DatePicker
              id="date"
              date={formData.date}
              onDateChange={handleDateChange}
              placeholder="Select due date"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
