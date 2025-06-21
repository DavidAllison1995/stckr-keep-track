
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMaintenance, MaintenanceTask } from '@/hooks/useMaintenance';

interface TaskEditFormProps {
  task: MaintenanceTask;
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskEditForm = ({ task, onSuccess, onCancel }: TaskEditFormProps) => {
  const { updateTask, deleteTask } = useMaintenance();
  const [formData, setFormData] = useState({
    title: task.title,
    notes: task.notes || '',
    date: task.date,
    recurrence: task.recurrence,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      return;
    }

    updateTask(task.id, {
      title: formData.title.trim(),
      notes: formData.notes || undefined,
      date: formData.date,
      recurrence: formData.recurrence,
    });

    onSuccess();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onSuccess();
  };

  return (
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
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="recurrence">Repeat</Label>
        <Select value={formData.recurrence} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurrence: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select recurrence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm">
              Delete
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
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete Task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
};

export default TaskEditForm;
