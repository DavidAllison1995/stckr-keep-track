import { useState, useMemo } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, addDays, subDays, startOfDay, endOfDay, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
  onAddTask?: () => void;
}

type ViewMode = 'month' | 'week' | 'day';

const MaintenanceCalendar = ({ onNavigateToItem, onAddTask }: MaintenanceCalendarProps) => {
  const { tasks } = useSupabaseMaintenance();
  const { settings } = useUserSettingsContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Calculate status counts for mobile status bar
  const statusCounts = useMemo(() => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const upToDate = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDate = new Date(task.date);
      return taskDate > fourteenDaysFromNow;
    }).length;

    const dueSoon = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDate = new Date(task.date);
      return taskDate >= now && taskDate <= fourteenDaysFromNow;
    }).length;

    const overdue = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDate = new Date(task.date);
      return taskDate < now;
    }).length;

    return { upToDate, dueSoon, overdue };
  }, [tasks]);

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
      
      // Use task.status for completed tasks, calculated status for others
      if (task.status === 'completed') {
        dayData.statusCounts.completed += 1;
      } else {
        dayData.statusCounts[status] += 1;
      }
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
    console.log('Task clicked:', task.id, 'Item ID:', task.item_id);
    if (onNavigateToItem && task.item_id) {
      onNavigateToItem(task.item_id, task.id);
    } else if (task.item_id) {
      // Navigate to item detail page with tasks tab and highlight the specific task
      const url = `/items/${task.item_id}?tab=tasks&highlight=${task.id}`;
      console.log('Navigating to:', url);
      navigate(url);
    }
  };

  const handleStatusTileClick = (status: string) => {
    navigate(`/tasks/${status}`);
  };

  const getTaskStatusColor = (task: MaintenanceTask) => {
    if (task.status === 'completed') {
      return 'bg-green-100 text-green-800';
    }
    
    const status = calculateTaskStatus(task.date);
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusBorderColor = (task: MaintenanceTask) => {
    if (task.status === 'completed') {
      return 'border-l-2 border-green-500';
    }
    
    const status = calculateTaskStatus(task.date);
    switch (status) {
      case 'overdue':
        return 'border-l-2 border-red-500';
      case 'due_soon':
        return 'border-l-2 border-yellow-500';
      default:
        return 'border-l-2 border-green-500';
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
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
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
          <div key={day} className={`${isMobile ? 'p-2' : 'p-3'} text-center text-sm font-medium text-gray-700 border-r last:border-r-0`}>
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
                ${isMobile ? 'min-h-[80px] p-2' : 'min-h-[100px] p-2'} border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors
                ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                ${!isCurrentMonth ? 'text-gray-300 bg-gray-25' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    ${isMobile ? 'text-sm' : 'text-sm'} font-medium
                    ${isTodayDate ? `bg-blue-500 text-white rounded-full ${isMobile ? 'w-6 h-6 text-sm' : 'w-6 h-6'} flex items-center justify-center` : ''}
                    ${isSelected && !isTodayDate ? 'text-blue-600' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              {/* Status Indicators */}
              {dayData && renderStatusIndicators(dayData)}
              
              {/* Task preview for current month days */}
              {isCurrentMonth && dayData && dayData.tasks.length > 0 && (
                <div className="space-y-1 mt-1">
                  {dayData.tasks
                    .slice(0, isMobile ? 2 : 2)
                    .map(task => {
                      const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                      return (
                        <div
                          key={task.id}
                          className={`${isMobile ? 'text-xs p-1' : 'text-xs p-1'} rounded truncate ${
                            taskStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            taskStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                            taskStatus === 'due_soon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                  {dayData.tasks.length > (isMobile ? 2 : 2) && (
                    <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
                      +{dayData.tasks.length - (isMobile ? 2 : 2)} more
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
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
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
      <div className="grid grid-cols-7 min-h-[500px]">
        {weekDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = tasksPerDay.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`
                border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${isMobile ? 'p-2' : 'p-3'}
                ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Day Header */}
              <div className="text-center mb-3 pb-2 border-b">
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 uppercase`}>
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`
                    ${isMobile ? 'text-base' : 'text-lg'} font-medium mt-1
                    ${isTodayDate ? `bg-blue-500 text-white rounded-full ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center mx-auto` : ''}
                  `}
                >
                  {format(day, 'd')}
                </div>
              </div>

              {/* Tasks for this day */}
              <div className={`space-y-2 ${isMobile ? 'max-h-[300px]' : 'max-h-[400px]'} overflow-y-auto`}>
                {dayData?.tasks.map(task => {
                  const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                  return (
                    <div
                      key={task.id}
                      className={`
                        ${isMobile ? 'text-xs p-1' : 'text-xs p-2'} rounded cursor-pointer hover:opacity-80 transition-opacity
                        ${getTaskStatusBorderColor(task)}
                        ${taskStatus === 'completed' ? 'bg-green-50 text-green-800' :
                          taskStatus === 'overdue' ? 'bg-red-50 text-red-800' :
                          taskStatus === 'due_soon' ? 'bg-yellow-50 text-yellow-800' :
                          'bg-gray-50 text-gray-800'}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      {task.notes && !isMobile && (
                        <div className="text-xs opacity-75 mt-1 truncate">{task.notes}</div>
                      )}
                    </div>
                  );
                })}
                {!dayData?.tasks.length && (
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 text-center py-4`}>
                    No tasks
                  </div>
                )}
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
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
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
        <div className={isMobile ? 'p-3' : 'p-6'}>
          {dayData && dayData.tasks.length > 0 ? (
            <div className="space-y-4">
              <h4 className={`font-medium text-gray-900 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Tasks for {format(currentDate, 'MMMM d, yyyy')} ({dayData.tasks.length})
              </h4>
              
              <div className={`space-y-3 ${isMobile ? 'max-h-[400px]' : 'max-h-[500px]'} overflow-y-auto`}>
                {dayData.tasks.map(task => {
                  const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                  return (
                    <div
                      key={task.id}
                      className={`
                        ${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors
                        ${getTaskStatusBorderColor(task)}
                        ${taskStatus === 'completed' ? 'border-green-200 bg-green-50' :
                          taskStatus === 'overdue' ? 'border-red-200 bg-red-50' :
                          taskStatus === 'due_soon' ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200 bg-gray-50'}
                      `}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{task.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(task)}`}>
                          {taskStatus === 'completed' ? 'Completed' :
                           taskStatus === 'due_soon' ? 'Due Soon' : 
                           taskStatus === 'overdue' ? 'Overdue' : 'Up to Date'}
                        </span>
                      </div>
                      
                      {task.notes && (
                        <p className={`text-sm text-gray-600 mb-2 ${isMobile ? 'text-xs' : ''}`}>{task.notes}</p>
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
            <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-16'} text-gray-500`}>
              <CalendarIcon className={`${isMobile ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} opacity-50`} />
              <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>No tasks scheduled</h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
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
    <div className={`h-full w-full ${isMobile ? 'space-y-1 px-2 py-1' : 'space-y-6'}`}>
      {/* Mobile Optimized Header Layout */}
      {isMobile ? (
        <div className="space-y-1">
          {/* Title and Add Button Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Maintenance Calendar</h1>
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white p-1 h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Mobile Status Tiles Row - Positioned after title */}
          <div className="flex justify-between gap-2 mb-1">
            <button
              onClick={() => handleStatusTileClick('up-to-date')}
              className="flex flex-col items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">{statusCounts.upToDate}</span>
            </button>
            <button
              onClick={() => handleStatusTileClick('due-soon')}
              className="flex flex-col items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            >
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">{statusCounts.dueSoon}</span>
            </button>
            <button
              onClick={() => handleStatusTileClick('overdue')}
              className="flex flex-col items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">{statusCounts.overdue}</span>
            </button>
          </div>
          
          {/* View Toggle Row */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={`text-xs px-3 py-1 h-7 ${viewMode === 'month' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={`text-xs px-3 py-1 h-7 ${viewMode === 'week' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={`text-xs px-3 py-1 h-7 ${viewMode === 'day' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              Day
            </Button>
          </div>
          
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 text-xs py-1 h-8"
            />
          </div>
        </div>
      ) : (
        // Desktop Header Layout (unchanged)
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
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
      )}

      {/* Main Calendar Layout */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-1 lg:grid-cols-4 gap-6'} w-full overflow-hidden`}>
        {/* Calendar View */}
        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'} w-full overflow-hidden`}>
          <div className={isMobile ? 'max-h-[60vh] overflow-y-auto' : ''}>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        </div>

        {/* Task Sidebar */}
        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'}`}>
          <Card className={`h-fit ${isMobile ? 'max-h-[30vh]' : 'max-h-[600px]'} overflow-hidden`}>
            <CardContent className={isMobile ? 'p-2' : 'p-6'}>
              <div className="space-y-4">
                <div>
                  <h3 className={`${isMobile ? 'text-xs' : 'text-lg'} font-semibold mb-2`}>
                    {format(selectedDate, isMobile ? 'MMM do' : 'EEEE, MMMM do, yyyy')}
                  </h3>
                </div>

                {tasksForSelectedDate.length > 0 ? (
                  <div className={`space-y-2 ${isMobile ? 'max-h-[20vh]' : 'max-h-[450px]'} overflow-y-auto`}>
                    {tasksForSelectedDate.map(task => {
                      const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                      return (
                        <div
                          key={task.id}
                          className={`${isMobile ? 'p-1' : 'p-3'} rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                            task.status === 'completed' ? 'opacity-60' : ''
                          }`}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>{task.title}</h4>
                            <span className={`text-xs px-1 py-0.5 rounded-full ${getTaskStatusColor(task)}`}>
                              {taskStatus === 'completed' ? 'Done' :
                               taskStatus === 'due_soon' ? 'Soon' : 
                               taskStatus === 'overdue' ? 'Late' : 'OK'}
                            </span>
                          </div>
                          
                          {task.notes && !isMobile && (
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{task.notes}</p>
                          )}
                          
                          {task.recurrence !== 'none' && (
                            <div className="text-xs text-gray-500">
                              <span className="capitalize">Repeats {task.recurrence}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-2' : 'py-8'} text-gray-500`}>
                    <CalendarIcon className={`${isMobile ? 'w-6 h-6 mb-1' : 'w-12 h-12 mb-3'} opacity-50`} />
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>No tasks on this date</p>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 mt-1`}>
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
