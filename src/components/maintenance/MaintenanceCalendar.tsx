
import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import TaskSearch from './TaskSearch';
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

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const { tasks } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Transform tasks into calendar events
  const events = useMemo(() => {
    return tasks
      .filter(task => task.status !== 'completed' || settings.showCompletedTasks)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.date),
        end: new Date(task.date),
        resource: task,
        allDay: true,
      }));
  }, [tasks, settings.showCompletedTasks]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const startDate = startOfDay(selectedDate);
    const endDate = endOfDay(selectedDate);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, selectedDate]);

  const handleSelectEvent = (event: any) => {
    const task = event.resource as MaintenanceTask;
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const eventStyleGetter = (event: any) => {
    const task = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (task.status) {
      case 'completed':
        backgroundColor = '#10b981';
        break;
      case 'overdue':
        backgroundColor = '#ef4444';
        break;
      case 'due_soon':
        backgroundColor = '#f59e0b';
        break;
      default:
        backgroundColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="text-lg font-semibold ml-2">{label}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="w-4 h-4" />
        </Button>
        <div className="flex border rounded-md">
          {['Day', 'Week', 'Month'].map((view) => (
            <Button
              key={view}
              variant={currentView === view.toLowerCase() ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onView(view.toLowerCase())}
              className="rounded-none first:rounded-l-md last:rounded-r-md"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {showSearch && (
        <TaskSearch
          onTaskSelect={(task) => {
            // Convert TaskSuggestion to proper navigation
            const maintenanceTask = tasks.find(t => t.id === task.id);
            if (onNavigateToItem && maintenanceTask?.item_id) {
              onNavigateToItem(maintenanceTask.item_id, maintenanceTask.id);
            }
          }}
        />
      )}

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          onNavigate={handleNavigate}
          onView={handleViewChange}
          view={currentView}
          date={currentDate}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          formats={{
            monthHeaderFormat: 'MMMM yyyy',
            dayHeaderFormat: 'EEEE, MMMM do',
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`,
          }}
        />
      </div>

      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">
              {format(selectedDate, 'EEEE, MMMM do, yyyy')}
            </h3>
            {tasksForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {tasksForSelectedDate.map(task => (
                  <div
                    key={task.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      task.status === 'completed' ? 'opacity-60' : ''
                    }`}
                    onClick={() => {
                      if (onNavigateToItem && task.item_id) {
                        onNavigateToItem(task.item_id, task.id);
                      }
                    }}
                  >
                    <div className="font-medium">{task.title}</div>
                    {task.notes && (
                      <div className="text-sm text-gray-600">{task.notes}</div>
                    )}
                    <div className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : task.status === 'due_soon'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>No tasks on this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceCalendar;
