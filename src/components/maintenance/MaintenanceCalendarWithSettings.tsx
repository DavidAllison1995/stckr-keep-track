
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Filter, Plus, Search } from 'lucide-react';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { formatDateWithUserPreference } from '@/utils/dateFormat';
import TaskSearch from './TaskSearch';
import StatusBar from './StatusBar';
import MaintenanceTaskForm from './MaintenanceTaskForm';
import TaskEditDialog from './TaskEditDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface MaintenanceCalendarWithSettingsProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendarWithSettings = ({ onNavigateToItem }: MaintenanceCalendarWithSettingsProps) => {
  const { tasks, isLoading } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const [view, setView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Set initial view based on user settings
  useEffect(() => {
    if (settings?.calendar?.defaultView) {
      setView(settings.calendar.defaultView);
    }
  }, [settings?.calendar?.defaultView]);

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const handleSearch = (query: string, status: string | null) => {
    setSearchQuery(query);
    setStatusFilter(status);
    
    let filtered = tasks;
    
    if (query) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.notes?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }
    
    setFilteredTasks(filtered);
  };

  const calendarEvents = filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.date),
    end: new Date(task.date),
    resource: task,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'due_soon': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const eventStyleGetter = (event: any) => {
    const backgroundColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor: backgroundColor.replace('bg-', '#'),
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const CustomEvent = ({ event }: { event: any }) => (
    <div className="text-xs p-1">
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-xs opacity-75">
        {formatDateWithUserPreference(event.start, settings?.calendar?.dateFormat)}
      </div>
    </div>
  );

  const handleSelectEvent = (event: any) => {
    if (onNavigateToItem && event.resource.item_id) {
      onNavigateToItem(event.resource.item_id, event.resource.id);
    } else {
      setSelectedTask(event.resource);
      setShowEditDialog(true);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
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

        <StatusBar tasks={tasks} />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TaskSearch onSearch={handleSearch} />
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
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={selectedDate}
            onNavigate={setSelectedDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
            }}
            formats={{
              dateFormat: settings?.calendar?.dateFormat === 'dd/MM/yyyy' ? 'dd' : 'DD',
              dayFormat: settings?.calendar?.dateFormat === 'dd/MM/yyyy' ? 'dd' : 'DD',
            }}
          />
        </div>
      </Card>

      {showForm && (
        <MaintenanceTaskForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          defaultDate={selectedDate}
        />
      )}

      {selectedTask && (
        <TaskEditDialog
          task={selectedTask}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
};

export default MaintenanceCalendarWithSettings;
