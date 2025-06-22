
import { useState, useMemo } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, addDays, subDays, startOfDay, endOfDay, isToday } from 'date-fns';
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

  // Calculate task status based on date
  const calculateTaskStatus = (taskDate: string) => {
    const now = new Date();
    const due = new Date(taskDate);
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return 'overdue';
    } else if (diffInDays <= 14) {
      return 'due_soon';
    } else {
      return 'up_to_date';
    }
  };

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

  // Get week days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get tasks per day with status information
  const tasksPerDay = useMemo(() => {
    const taskMap = new Map<string, { tasks: MaintenanceTask[], statusCounts: Record<string, number> }>();
    
    filteredTasks.forEach(task => {
      const dateKey = format(new Date(task.date), 'yyyy-MM-dd');
      const status = calculateTaskStatus(task.date);
      
      if (!taskMap.has(dateKey)) {
        taskMap.set(dateKey, { 
          tasks: [], 
          statusCounts: { up_to_date: 0, due_soon: 0, overdue: 0, completed: 0 }
        });
      }
      
      const dayData = taskMap.get(dateKey)!;
      dayData.tasks.push(task);
      dayData.statusCounts[status] += 1;
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

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-500';
      case 'due_soon':
        return 'bg-yellow-500';
      case 'up_to_date':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const renderStatusIndicators = (dayData: { tasks: MaintenanceTask[], statusCounts: Record<string, number> }) => {
    const indicators = [];
    const { statusCounts } = dayData;
    
    if (statusCounts.overdue > 0) {
      indicators.push(
        <div key="overdue" className="w-2 h-2 bg-red-500 rounded-full" title={`${statusCounts.overdue} overdue tasks`} />
      );
    }
    if (statusCounts.due_soon > 0) {
      indicators.push(
        <div key="due_soon" className="w-2 h-2 bg-yellow-500 rounded-full" title={`${statusCounts.due_soon} due soon tasks`} />
      );
    }
    if (statusCounts.up_to_date > 0) {
      indicators.push(
        <div key="up_to_date" className="w-2 h-2 bg-green-500 rounded-full" title={`${statusCounts.up_to_date} up-to-date tasks`} />
      );
    }
    if (statusCounts.completed > 0 && settings.showCompletedTasks) {
      indicators.push(
        <div key="completed" className="w-2 h-2 bg-gray-400 rounded-full" title={`${statusCounts.completed} completed tasks`} />
      );
    }
    
    return (
      <div className="flex gap-1 flex-wrap justify-center mt-1">
        {indicators.slice(0, 4)}
        {indicators.length > 4 && <div className="text-xs text-gray-500">+{indicators.length - 4}</div>}
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="bg-white rounded-lg border overflow-hidden w-full">
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
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = tasksPerDay.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

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
                    ${isTodayDate ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${isSelected && !isTodayDate ? 'text-blue-600' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
                {dayData && dayData.tasks.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dayData.tasks.length}
                  </span>
                )}
              </div>
              
              {/* Status Indicators */}
              {dayData && renderStatusIndicators(dayData)}
              
              {/* Task preview for current month days */}
              {isCurrentMonth && dayData && dayData.tasks.length > 0 && (
                <div className="space-y-1 mt-2">
                  {dayData.tasks
                    .slice(0, 2)
                    .map(task => {
                      const taskStatus = calculateTaskStatus(task.date);
                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            taskStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                            taskStatus === 'due_soon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                  {dayData.tasks.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayData.tasks.length - 2} more
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
    <div className="bg-white rounded-lg border overflow-hidden w-full">
      {/* Week Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          Week of {format(startOfWeek(currentDate), 'MMM d, yyyy')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = tasksPerDay.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`
                border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors p-3
                ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Day Header */}
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500 uppercase">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`
                    text-lg font-medium
                    ${isTodayDate ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}
                  `}
                >
                  {format(day, 'd')}
                </div>
              </div>

              {/* Tasks for this day */}
              <div className="space-y-2">
                {dayData?.tasks.map(task => {
                  const taskStatus = calculateTaskStatus(task.date);
                  return (
                    <div
                      key={task.id}
                      className={`
                        text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity
                        ${taskStatus === 'overdue' ? 'bg-red-100 text-red-800 border-l-2 border-red-500' :
                          taskStatus === 'due_soon' ? 'bg-yellow-100 text-yellow-800 border-l-2 border-yellow-500' :
                          'bg-green-100 text-green-800 border-l-2 border-green-500'}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      {task.notes && (
                        <div className="text-xs opacity-75 mt-1 truncate">{task.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayData = tasksPerDay.get(format(currentDate, 'yyyy-MM-dd'));
    
    return (
      <div className="bg-white rounded-lg border overflow-hidden w-full">
        {/* Day Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Content */}
        <div className="p-6">
          {dayData && dayData.tasks.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-4">
                Tasks for {format(currentDate, 'MMMM d, yyyy')} ({dayData.tasks.length})
              </h4>
              
              <div className="space-y-3">
                {dayData.tasks.map(task => {
                  const taskStatus = calculateTaskStatus(task.date);
                  return (
                    <div
                      key={task.id}
                      className={`
                        p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors
                        ${taskStatus === 'overdue' ? 'border-red-200 bg-red-50' :
                          taskStatus === 'due_soon' ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'}
                      `}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(taskStatus)}`}>
                          {taskStatus === 'due_soon' ? 'Due Soon' : 
                           taskStatus === 'overdue' ? 'Overdue' : 
                           taskStatus === 'completed' ? 'Completed' : 'Up to Date'}
                        </span>
                      </div>
                      
                      {task.notes && (
                        <p className="text-sm text-gray-600 mb-2">{task.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {task.recurrence !== 'none' && (
                          <span className="capitalize">Repeats {task.recurrence}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <CalendarIcon className="w-16 h-16 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No tasks scheduled</h4>
              <p className="text-sm text-gray-400">
                No tasks are scheduled for {format(currentDate, 'MMMM d, yyyy')}
              </p>
              {onAddTask && (
                <Button onClick={onAddTask} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full space-y-6 w-full overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* View Toggle - moved to left with title */}
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
          
          {onAddTask && (
            <Button onClick={onAddTask} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full overflow-hidden">
        {/* Calendar View */}
        <div className="lg:col-span-3 w-full overflow-hidden">
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
                    {tasksForSelectedDate.map(task => {
                      const taskStatus = calculateTaskStatus(task.date);
                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                            task.status === 'completed' ? 'opacity-60' : ''
                          }`}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(taskStatus)}`}>
                              {taskStatus === 'due_soon' ? 'Due Soon' : 
                               taskStatus === 'overdue' ? 'Overdue' : 
                               taskStatus === 'completed' ? 'Completed' : 'Up to Date'}
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
                      );
                    })}
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
