
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import TaskSearch from './TaskSearch';
import StatusBar from './StatusBar';
import MaintenanceTaskForm from './MaintenanceTaskForm';
import TaskEditDialog from './TaskEditDialog';
import MaintenanceCalendar from './MaintenanceCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MaintenanceCalendarWithSettingsProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendarWithSettings = ({ onNavigateToItem }: MaintenanceCalendarWithSettingsProps) => {
  const { tasks, isLoading } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Set initial view based on user settings
  useEffect(() => {
    if (settings?.calendar?.defaultView) {
      setView(settings.calendar.defaultView);
    }
  }, [settings?.calendar?.defaultView]);

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const handleTaskSelect = (task: any) => {
    if (onNavigateToItem && task.itemName !== 'No Item') {
      // Navigate to item if it has one
      const foundTask = tasks.find(t => t.id === task.id);
      if (foundTask?.item_id) {
        onNavigateToItem(foundTask.item_id, foundTask.id);
      }
    } else {
      // Show edit dialog
      const foundTask = tasks.find(t => t.id === task.id);
      if (foundTask) {
        setSelectedTask(foundTask);
        setShowEditDialog(true);
      }
    }
  };

  const handleTaskClick = (task: any) => {
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
    } else {
      setSelectedTask(task);
      setShowEditDialog(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Maintenance Calendar</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <StatusBar />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TaskSearch onTaskSelect={handleTaskSelect} />
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <MaintenanceCalendar
          onTaskClick={handleTaskClick}
          onDateSelect={handleDateSelect}
          dateFormat={settings?.calendar?.dateFormat}
        />
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Task</DialogTitle>
          </DialogHeader>
          <MaintenanceTaskForm
            onSuccess={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskEditDialog
          task={selectedTask}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceCalendarWithSettings;
