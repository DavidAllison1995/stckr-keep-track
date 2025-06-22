
import { useState, useMemo } from 'react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import TaskSearch from './TaskSearch';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const { tasks } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSearch, setShowSearch] = useState(false);

  // Filter tasks based on settings
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.status !== 'completed' || settings.showCompletedTasks
    );
  }, [tasks, settings.showCompletedTasks]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const startDate = startOfDay(selectedDate);
    const endDate = endOfDay(selectedDate);
    
    return filteredTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [filteredTasks, selectedDate]);

  // Get dates that have tasks for calendar highlighting
  const datesWithTasks = useMemo(() => {
    return filteredTasks.map(task => new Date(task.date));
  }, [filteredTasks]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTaskClick = (task: MaintenanceTask) => {
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
    }
  };

  const handleTaskSearchSelect = (task: any) => {
    // Convert TaskSuggestion to proper navigation
    const maintenanceTask = tasks.find(t => t.id === task.id);
    if (onNavigateToItem && maintenanceTask?.item_id) {
      onNavigateToItem(maintenanceTask.item_id, maintenanceTask.id);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Calendar View</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="w-4 h-4 mr-2" />
          Search Tasks
        </Button>
      </div>

      {showSearch && (
        <TaskSearch onTaskSelect={handleTaskSearchSelect} />
      )}

      {/* Calendar and Task Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={{
                hasTask: datesWithTasks,
              }}
              modifiersStyles={{
                hasTask: { 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold'
                },
              }}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        {/* Task Detail Side Panel */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                </h3>
              </div>

              {tasksForSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {tasksForSelectedDate.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        task.status === 'completed' ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status === 'due_soon' ? 'Due Soon' : 
                           task.status === 'overdue' ? 'Overdue' : 
                           task.status === 'completed' ? 'Completed' : 'Up to Date'}
                        </span>
                      </div>
                      
                      {task.notes && (
                        <p className="text-xs text-gray-600 mb-2">{task.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {task.recurrence !== 'none' && (
                          <span className="capitalize">Repeats {task.recurrence}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No tasks on this date</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click a highlighted date to see tasks
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
