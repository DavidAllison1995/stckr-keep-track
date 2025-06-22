
import { useState, useMemo } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, addDays, subDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Plus } from 'lucide-react';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
  onAddTask?: () => void;
}

type ViewMode = 'month' | 'week' | 'day';

const MaintenanceCalendar = ({ onNavigateToItem, onAddTask }: MaintenanceCalendarProps) => {
  const { tasks } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on settings and search
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => 
      task.status !== 'completed' || settings.showCompletedTasks
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.notes && task.notes.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [tasks, settings.showCompletedTasks, searchQuery]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return filteredTasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, selectedDate);
    });
  }, [filteredTasks, selectedDate]);

  // Get calendar days for month view
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get tasks count per day for indicators
  const tasksPerDay = useMemo(() => {
    const taskMap = new Map<string, number>();
    filteredTasks.forEach(task => {
      const dateKey = format(new Date(task.date), 'yyyy-MM-dd');
      taskMap.set(dateKey, (taskMap.get(dateKey) || 0) + 1);
    });
    return taskMap;
  }, [filteredTasks]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => subDays(prev, 7));
    } else {
      setCurrentDate(prev => subDays(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const handleTaskClick = (task: MaintenanceTask) => {
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
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

  const renderMonthView = () => (
    <div className="bg-white rounded-lg border overflow-hidden max-w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 overflow-hidden">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const taskCount = tasksPerDay.get(dateKey) || 0;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors
                ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                ${!isCurrentMonth ? 'text-gray-300 bg-gray-25' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${isSelected && !isToday ? 'text-blue-600' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
                {taskCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {taskCount}
                  </span>
                )}
              </div>
              
              {/* Task preview for current month days */}
              {isCurrentMonth && taskCount > 0 && (
                <div className="space-y-1">
                  {filteredTasks
                    .filter(task => isSameDay(new Date(task.date), day))
                    .slice(0, 2)
                    .map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                  {taskCount > 2 && (
                    <div className="text-xs text-gray-500">
                      +{taskCount - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-lg border p-8 max-w-full">
      <div className="text-center text-gray-500 py-16">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Week View Coming Soon</h3>
        <p className="text-sm">This feature is currently under development</p>
      </div>
    </div>
  );

  const renderDayView = () => (
    <div className="bg-white rounded-lg border p-8 max-w-full">
      <div className="text-center text-gray-500 py-16">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Day View Coming Soon</h3>
        <p className="text-sm">This feature is currently under development</p>
      </div>
    </div>
  );

  return (
    <div className="h-full space-y-6 max-w-full overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Maintenance Calendar</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={`${viewMode === 'month' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={`${viewMode === 'week' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={`${viewMode === 'day' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Day
            </Button>
          </div>
          
          {onAddTask && (
            <Button onClick={onAddTask} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-full overflow-hidden">
        {/* Calendar View */}
        <div className="lg:col-span-3 w-full max-w-full overflow-hidden">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Task Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-fit max-h-[600px] overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                  </h3>
                </div>

                {tasksForSelectedDate.length > 0 ? (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto">
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
                      Click a day with tasks to see them here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
