
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
import { calculateTaskStatus, getStatusLabel, getStatusColor, getStatusBorderColor, getTaskStatusCounts, TaskStatus } from '@/utils/taskStatus';

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

  // Calculate status counts for mobile status bar using centralized logic
  const statusCounts = useMemo(() => {
    return getTaskStatusCounts(tasks.filter(task => task.status !== 'completed'));
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

  // Get tasks per day with status information using centralized logic
  const tasksPerDay = useMemo(() => {
    const taskMap = new Map<string, { tasks: MaintenanceTask[], statusCounts: Record<string, number> }>();
    
    filteredTasks.forEach(task => {
      const dateKey = format(new Date(task.date), 'yyyy-MM-dd');
      const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
      
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

  const getTaskStatusColorClass = (task: MaintenanceTask) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusColor(status as TaskStatus);
  };

  const getTaskStatusBorderColorClass = (task: MaintenanceTask) => {
    const status = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
    return getStatusBorderColor(status as TaskStatus);
  };

  const renderStatusIndicators = (dayData: { tasks: MaintenanceTask[], statusCounts: Record<string, number> }) => {
    const indicators = [];
    const { statusCounts } = dayData;
    
    if (statusCounts.overdue > 0) {
      indicators.push(
        <div key="overdue" className="w-2 h-2 bg-red-500 rounded-full shadow-lg" title={`${statusCounts.overdue} overdue tasks`} />
      );
    }
    if (statusCounts.due_soon > 0) {
      indicators.push(
        <div key="due_soon" className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg" title={`${statusCounts.due_soon} due soon tasks`} />
      );
    }
    if (statusCounts.up_to_date > 0) {
      indicators.push(
        <div key="up_to_date" className="w-2 h-2 bg-green-500 rounded-full shadow-lg" title={`${statusCounts.up_to_date} up-to-date tasks`} />
      );
    }
    if (statusCounts.completed > 0 && settings.showCompletedTasks) {
      indicators.push(
        <div key="completed" className="w-2 h-2 bg-purple-400 rounded-full shadow-lg" title={`${statusCounts.completed} completed tasks`} />
      );
    }
    
    return (
      <div className="flex gap-1 flex-wrap justify-center mt-1">
        {indicators.slice(0, 4)}
        {indicators.length > 4 && <div className="text-xs text-gray-400">+{indicators.length - 4}</div>}
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full shadow-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-700 bg-gray-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={`${isMobile ? 'p-1.5' : 'p-3'} text-center text-sm font-medium text-gray-300 border-r border-gray-700 last:border-r-0`}>
            {isMobile ? day.slice(0, 1) : day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Mobile Optimized */}
      <div className="grid grid-cols-7 bg-gray-900">
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
                ${isMobile ? 'h-16 p-1' : 'min-h-[100px] p-2'} 
                border-r border-b border-gray-700 last:border-r-0 
                cursor-pointer hover:bg-gray-800/50 transition-all duration-200
                ${isSelected ? 'bg-purple-900/30 border-purple-500' : ''}
                ${!isCurrentMonth ? 'text-gray-500 bg-gray-900/50' : 'bg-gray-900'}
                ${isTodayDate && !isSelected ? 'bg-purple-900/20' : ''}
                ${isMobile ? 'flex flex-col' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {isMobile ? (
                /* Mobile: Compact 2-line layout */
                <>
                  {/* Top line: Date number and mini status indicators */}
                  <div className="flex items-center justify-between h-6">
                    <span
                      className={`
                        text-xs font-medium transition-all duration-200
                        ${isTodayDate ? 'bg-purple-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg' : ''}
                        ${isSelected && !isTodayDate ? 'text-purple-400 font-bold' : ''}
                        ${!isSelected && !isTodayDate && isCurrentMonth ? 'text-gray-200' : ''}
                        ${!isCurrentMonth ? 'text-gray-500' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                    {/* Mini status indicators (only if tasks exist) */}
                    {dayData && dayData.tasks.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayData.statusCounts.overdue > 0 && (
                          <div className="w-1 h-1 bg-red-500 rounded-full" />
                        )}
                        {dayData.statusCounts.due_soon > 0 && (
                          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                        )}
                        {dayData.statusCounts.up_to_date > 0 && (
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                        )}
                        {dayData.statusCounts.completed > 0 && settings.showCompletedTasks && (
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom line: Task preview (emoji + short title) */}
                  {isCurrentMonth && dayData && dayData.tasks.length > 0 && (
                    <div className="flex-1 flex flex-col justify-center">
                      {dayData.tasks.slice(0, 1).map(task => {
                        const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                        return (
                          <div
                            key={task.id}
                            className="text-xs truncate leading-tight"
                            style={{ 
                              color: taskStatus === 'completed' ? '#c084fc' :
                                     taskStatus === 'overdue' ? '#fca5a5' :
                                     taskStatus === 'due_soon' ? '#fde047' : '#d1d5db'
                            }}
                          >
                            {task.title.length > 8 ? task.title.slice(0, 8) + '...' : task.title}
                          </div>
                        );
                      })}
                      {dayData.tasks.length > 1 && (
                        <div className="text-xs text-gray-500 leading-none">
                          +{dayData.tasks.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Desktop: Original layout */
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-sm font-medium transition-all duration-200
                        ${isTodayDate ? 'bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg' : ''}
                        ${isSelected && !isTodayDate ? 'text-purple-400 font-bold' : ''}
                        ${!isSelected && !isTodayDate && isCurrentMonth ? 'text-gray-200' : ''}
                        ${!isCurrentMonth ? 'text-gray-500' : ''}
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
                        .slice(0, 2)
                        .map(task => {
                          const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                          return (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded truncate transition-all duration-200 ${
                                taskStatus === 'completed' ? 'bg-purple-900/50 text-purple-200 border border-purple-600/30' :
                                taskStatus === 'overdue' ? 'bg-red-900/50 text-red-200 border border-red-600/30' :
                                taskStatus === 'due_soon' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-600/30' :
                                'bg-gray-800/80 text-gray-200 border border-gray-600/30'
                              }`}
                            >
                              {task.title}
                            </div>
                          );
                        })}
                      {dayData.tasks.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{dayData.tasks.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full shadow-lg">
      {/* Week Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
          Week of {format(startOfWeek(currentDate), 'MMM d, yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 min-h-[500px] bg-gray-900">
        {weekDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = tasksPerDay.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`
                border-r border-b border-gray-700 last:border-r-0 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 ${isMobile ? 'p-2' : 'p-3'}
                ${isSelected ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-900'}
                ${isTodayDate && !isSelected ? 'bg-purple-900/20' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Day Header */}
              <div className="text-center mb-3 pb-2 border-b border-gray-700">
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 uppercase font-medium`}>
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`
                    ${isMobile ? 'text-base' : 'text-lg'} font-medium mt-1 transition-all duration-200
                    ${isTodayDate ? `bg-purple-600 text-white rounded-full ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center mx-auto shadow-lg` : 'text-gray-200'}
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
                        ${isMobile ? 'text-xs p-1' : 'text-xs p-2'} rounded cursor-pointer hover:opacity-80 transition-all duration-200
                        ${getTaskStatusBorderColorClass(task)}
                        ${taskStatus === 'completed' ? 'bg-purple-900/50 text-purple-200 border border-purple-600/30' :
                          taskStatus === 'overdue' ? 'bg-red-900/50 text-red-200 border border-red-600/30' :
                          taskStatus === 'due_soon' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-600/30' :
                          'bg-gray-800/80 text-gray-200 border border-gray-600/30'}
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
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 text-center py-4`}>
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
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full shadow-lg">
        {/* Day Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Content */}
        <div className={`${isMobile ? 'p-3' : 'p-6'} bg-gray-900`}>
          {dayData && dayData.tasks.length > 0 ? (
            <div className="space-y-4">
              <h4 className={`font-bold text-white mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Tasks for {format(currentDate, 'MMMM d, yyyy')} ({dayData.tasks.length})
              </h4>
              
              <div className={`space-y-3 ${isMobile ? 'max-h-[400px]' : 'max-h-[500px]'} overflow-y-auto`}>
                {dayData.tasks.map(task => {
                  const taskStatus = task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date);
                  return (
                    <div
                      key={task.id}
                      className={`
                        ${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-all duration-200
                        ${getTaskStatusBorderColorClass(task)}
                        ${taskStatus === 'completed' ? 'border-purple-600/50 bg-purple-900/20' :
                          taskStatus === 'overdue' ? 'border-red-600/50 bg-red-900/20' :
                          taskStatus === 'due_soon' ? 'border-yellow-600/50 bg-yellow-900/20' :
                          'border-gray-600/50 bg-gray-800/30'}
                      `}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className={`font-medium text-white ${isMobile ? 'text-sm' : 'text-base'}`}>{task.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColorClass(task)}`}>
                          {taskStatus === 'completed' ? 'Completed' :
                           taskStatus === 'due_soon' ? 'Soon' : 
                           taskStatus === 'overdue' ? 'Late' : 'OK'}
                        </span>
                      </div>
                      
                      {task.notes && (
                        <p className={`text-sm text-gray-300 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>{task.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-400">
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
            <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-16'} text-gray-400`}>
              <CalendarIcon className={`${isMobile ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} opacity-50`} />
              <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2 text-white`}>No tasks scheduled</h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                No tasks are scheduled for {format(currentDate, 'MMMM d, yyyy')}
              </p>
              {onAddTask && (
                <Button onClick={onAddTask} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200">
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
            <h1 className="text-lg font-bold text-purple-400">Maintenance Calendar</h1>
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white p-1 h-8 w-8 transition-all duration-200">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Mobile Status Tiles Row - Positioned after title */}
          <div className="flex justify-between gap-2 mb-1">
            <button
              onClick={() => handleStatusTileClick('up-to-date')}
              className="flex flex-col items-center gap-1 bg-green-900/30 border border-green-600/50 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-green-900/50 active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">{statusCounts.up_to_date}</span>
            </button>
            <button
              onClick={() => handleStatusTileClick('due-soon')}
              className="flex flex-col items-center gap-1 bg-yellow-900/30 border border-yellow-600/50 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-yellow-900/50 active:scale-95"
            >
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-300">{statusCounts.due_soon}</span>
            </button>
            <button
              onClick={() => handleStatusTileClick('overdue')}
              className="flex flex-col items-center gap-1 bg-red-900/30 border border-red-600/50 rounded-lg px-3 py-2 flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-red-900/50 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">{statusCounts.overdue}</span>
            </button>
          </div>
          
          {/* View Toggle Row */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 w-fit border border-gray-700">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={`text-xs px-3 py-1 h-7 transition-all duration-200 ${viewMode === 'month' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={`text-xs px-3 py-1 h-7 transition-all duration-200 ${viewMode === 'week' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={`text-xs px-3 py-1 h-7 transition-all duration-200 ${viewMode === 'day' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              Day
            </Button>
          </div>
          
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-purple-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 text-xs py-1 h-8 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>
      ) : (
        // Desktop Header Layout
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={`transition-all duration-200 ${viewMode === 'month' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={`transition-all duration-200 ${viewMode === 'week' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className={`transition-all duration-200 ${viewMode === 'day' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                Day
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200">
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
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Task Sidebar */}
        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'}`}>
          <Card className={`h-fit ${isMobile ? 'max-h-[30vh]' : 'max-h-[600px]'} overflow-hidden bg-gray-900 border-gray-700 shadow-lg`}>
            <CardContent className={`${isMobile ? 'p-2' : 'p-6'} bg-gray-900`}>
              <div className="space-y-4">
                <div>
                  <h3 className={`${isMobile ? 'text-xs' : 'text-lg'} font-semibold mb-2 text-white`}>
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
                          className={`${isMobile ? 'p-1' : 'p-3'} rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-all duration-200 ${
                            task.status === 'completed' ? 'opacity-60' : ''
                          } ${
                            taskStatus === 'completed' ? 'border-purple-600/50 bg-purple-900/20' :
                            taskStatus === 'overdue' ? 'border-red-600/50 bg-red-900/20' :
                            taskStatus === 'due_soon' ? 'border-yellow-600/50 bg-yellow-900/20' :
                            'border-gray-600/50 bg-gray-800/30'
                          }`}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate text-white`}>{task.title}</h4>
                            <span className={`text-xs px-1 py-0.5 rounded-full ${getTaskStatusColorClass(task)}`}>
                              {taskStatus === 'completed' ? 'Done' :
                               taskStatus === 'due_soon' ? 'Soon' : 
                               taskStatus === 'overdue' ? 'Late' : 'OK'}
                            </span>
                          </div>
                          
                          {task.notes && !isMobile && (
                            <p className="text-xs text-gray-300 mb-1 line-clamp-1">{task.notes}</p>
                          )}
                          
                          {task.recurrence !== 'none' && (
                            <div className="text-xs text-gray-400">
                              <span className="capitalize">Repeats {task.recurrence}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-2' : 'py-8'} text-gray-400`}>
                    <CalendarIcon className={`${isMobile ? 'w-6 h-6 mb-1' : 'w-12 h-12 mb-3'} opacity-50 text-purple-400`} />
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white`}>No tasks on this date</p>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>
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
