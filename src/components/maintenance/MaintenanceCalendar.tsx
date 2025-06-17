import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Download, Edit, Trash2 } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';
import { generateICSFile } from '@/utils/calendarExport';
import StatusBar from './StatusBar';

type ViewMode = 'day' | 'week' | 'month';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const { tasks } = useMaintenance();
  const { getItemById } = useItems();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.itemId && getItemById(task.itemId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get tasks for selected date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => task.date.startsWith(dateStr));
  };

  // Get upcoming tasks (after selected date)
  const getUpcomingTasks = () => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return filteredTasks
      .filter(task => task.date > selectedDateStr)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const navigateToItem = (itemId: string, taskId?: string) => {
    if (onNavigateToItem) {
      onNavigateToItem(itemId, taskId);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    if (task.itemId) {
      navigateToItem(task.itemId, task.id);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length > 0) {
      setSelectedTask(tasksForDate[0]);
    } else {
      setSelectedTask(null);
    }
  };

  const handleExportToCalendar = (task: any) => {
    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
    generateICSFile(task, assignedItem?.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'due_soon': return 'bg-yellow-500';
      case 'up_to_date': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-800 bg-red-100';
      case 'due_soon': return 'text-yellow-800 bg-yellow-100';
      case 'up_to_date': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
    } else {
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    const tasksForToday = getTasksForDate(today);
    if (tasksForToday.length > 0) {
      setSelectedTask(tasksForToday[0]);
    } else {
      setSelectedTask(null);
    }
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    if (viewMode === 'month') {
      return generateMonthView();
    } else if (viewMode === 'week') {
      return generateWeekView();
    } else {
      return generateDayView();
    }
  };

  const generateMonthView = () => {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(startOfMonth.getDate() - startOfMonth.getDay());
    
    // Calculate how many weeks we need to show all days of the current month
    const endOfWeek = new Date(endOfMonth);
    endOfWeek.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));
    
    const totalDays = Math.ceil((endOfWeek.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);
    
    const days = [];
    const current = new Date(startOfWeek);
    
    // Generate only the weeks needed to show the current month
    for (let week = 0; week < weeksNeeded; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(current);
        const dayTasks = getTasksForDate(date);
        const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        
        weekDays.push(
          <div
            key={date.toISOString()}
            className={`
              min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-all duration-200
              ${isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : 'hover:bg-gray-50'}
              ${!isCurrentMonth ? 'text-gray-400 bg-gray-25' : ''}
              ${isToday ? 'bg-blue-50 border-blue-200' : ''}
            `}
            onClick={() => handleDateSelect(date)}
          >
            <div className={`
              text-sm font-medium mb-2 
              ${isToday ? 'text-blue-600 font-semibold' : ''}
              ${!isCurrentMonth ? 'text-gray-400' : ''}
            `}>
              {date.getDate()}
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map((task, index) => (
                <div
                  key={task.id}
                  className={`
                    text-xs px-2 py-1 rounded-md truncate cursor-pointer transition-colors
                    ${getStatusTextColor(task.status)}
                    hover:shadow-sm
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-xs text-gray-500 px-2 font-medium">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        current.setDate(current.getDate() + 1);
      }
      days.push(
        <div key={week} className="grid grid-cols-7">
          {weekDays}
        </div>
      );
    }
    
    return days;
  };

  const generateWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    const current = new Date(startOfWeek);
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(current);
      const dayTasks = getTasksForDate(date);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      
      weekDays.push(
        <div
          key={date.toISOString()}
          className={`
            min-h-[400px] p-3 border border-gray-100 cursor-pointer transition-all duration-200
            ${isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : 'hover:bg-gray-50'}
            ${isToday ? 'bg-blue-50 border-blue-200' : ''}
          `}
          onClick={() => handleDateSelect(date)}
        >
          <div className={`
            text-center mb-3 pb-2 border-b border-gray-200
            ${isToday ? 'text-blue-600 font-semibold' : ''}
          `}>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg font-medium">
              {date.getDate()}
            </div>
          </div>
          <div className="space-y-2">
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${getStatusTextColor(task.status)}
                  hover:shadow-sm
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskClick(task);
                }}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="text-xs opacity-70">
                  {task.itemId && getItemById(task.itemId)?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      current.setDate(current.getDate() + 1);
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 border-b">
            {day}
          </div>
        ))}
        {weekDays}
      </div>
    );
  };

  const generateDayView = () => {
    const dayTasks = getTasksForDate(selectedDate);
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    
    return (
      <div className="h-full border border-gray-200 rounded-lg overflow-visible">
        <div className={`
          p-4 border-b border-gray-200
          ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}
        `}>
          <div className="text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className={`text-2xl font-semibold ${isToday ? 'text-blue-600' : ''}`}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3 overflow-visible">
          {dayTasks.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks scheduled for this day</p>
            </div>
          ) : (
            dayTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all duration-200
                  ${getStatusTextColor(task.status)}
                  hover:shadow-md
                `}
                onClick={() => handleTaskClick(task)}
              >
                <div className="font-semibold text-lg mb-2">{task.title}</div>
                {task.notes && (
                  <div className="text-sm opacity-80 mb-2">{task.notes}</div>
                )}
                <div className="text-sm opacity-70">
                  {task.itemId && getItemById(task.itemId)?.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const selectedDateTasks = getTasksForDate(selectedDate);
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold min-w-0">
              {formatDateHeader()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="ml-4"
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="px-3 py-1 text-xs rounded-md"
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="px-3 py-1 text-xs rounded-md"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="px-3 py-1 text-xs rounded-md"
              >
                Month
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-4">
        <StatusBar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Calendar Section - Full width on mobile, 75% on desktop */}
        <div className="w-full lg:w-3/4 p-6">
          <Card className="w-full">
            <CardContent className="p-0 w-full">
              <div className="w-full min-h-[600px] h-[75vh]">
                {viewMode === 'month' && (
                  <div className="h-full flex flex-col w-full">
                    {/* Month header */}
                    <div className="grid grid-cols-7 w-full">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-3 border-b">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="flex-1 w-full">
                      {generateCalendarGrid()}
                    </div>
                  </div>
                )}
                {viewMode === 'week' && generateCalendarGrid()}
                {viewMode === 'day' && generateCalendarGrid()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Hidden on mobile, 25% on desktop */}
        <div className="w-full lg:w-1/4 p-6 space-y-6">
          {/* Date Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tasks on this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => {
                    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              task.status === 'due_soon' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.status === 'overdue' ? 'Overdue' :
                             task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                          </Badge>
                        </div>
                        {assignedItem && (
                          <p className="text-xs text-gray-600">{assignedItem.name}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => {
                    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">
                            {task.status === 'overdue' ? '🔴' : 
                             task.status === 'due_soon' ? '🟡' : '🟢'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                            <p className="text-xs text-gray-600">
                              {assignedItem?.name} • {new Date(task.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Details Panel - Full width below main content */}
      <div className="border-t bg-white w-full">
        <div className="px-6 py-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedTask.title}</h3>
                    {selectedTask.notes && (
                      <p className="text-gray-600 mb-4">{selectedTask.notes}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Scheduled Date:</span>
                      <p className="text-gray-600">{new Date(selectedTask.date).toLocaleDateString()}</p>
                    </div>
                    {selectedTask.itemId && (
                      <div>
                        <span className="font-medium">Item:</span>
                        <p className="text-blue-600 cursor-pointer hover:underline">
                          {getItemById(selectedTask.itemId)?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportToCalendar(selectedTask)}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Add to Calendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Select a date with tasks to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
