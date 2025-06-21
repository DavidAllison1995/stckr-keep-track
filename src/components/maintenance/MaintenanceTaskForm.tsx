import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';

interface MaintenanceTaskFormProps {
  itemId?: string;
  onSuccess: () => void;
}

const MaintenanceTaskForm = ({ itemId, onSuccess }: MaintenanceTaskFormProps) => {
  const { addTask } = useSupabaseMaintenance();
  const { items } = useSupabaseItems();
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    date: '',
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    selectedItemId: itemId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      return;
    }

    // Calculate the appropriate status based on the due date
    const today = new Date();
    const dueDate = new Date(formData.date);
    const diffInDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'due_soon';
    if (diffInDays < 0) {
      status = 'overdue';
    } else if (diffInDays <= 7) {
      status = 'due_soon';
    } else {
      status = 'pending';
    }

    addTask({
      item_id: formData.selectedItemId === 'unassigned' ? null : formData.selectedItemId || null,
      title: formData.title.trim(),
      notes: formData.notes || null,
      date: formData.date,
      recurrence: formData.recurrence,
      recurrence_rule: null,
      parent_task_id: null,
      status: status,
    });

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

      {!itemId && (
        <div>
          <Label htmlFor="item">Assign to Item (Optional)</Label>
          <Select value={formData.selectedItemId || 'unassigned'} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedItemId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">No specific item</SelectItem>
              {items.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          Add Task
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceTaskForm;
