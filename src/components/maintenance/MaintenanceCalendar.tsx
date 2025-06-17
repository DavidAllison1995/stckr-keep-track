
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Download, Edit, Trash2 } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';
import { generateICSFile } from '@/utils/calendarExport';

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const tasksForDate = getTasksForDate(date);
      if (tasksForDate.length > 0) {
        setSelectedTask(tasksForDate[0]);
      } else {
        setSelectedTask(null);
      }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return '🔴';
      case 'due_soon': return '🟡';
      case 'up_to_date': return '🟢';
      default: return '⚪';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
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

  const selectedDateTasks = getTasksForDate(selectedDate);
  const upcomingTasks = getUpcomingTasks();

  // Custom day content for calendar with task indicators
  const renderDayContent = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 items-center">
        <div className="flex gap-1 flex-wrap justify-center">
          {dayTasks.slice(0, 3).map((task, index) => (
            <div
              key={task.id}
              className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}
            />
          ))}
          {dayTasks.length > 3 && (
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          )}
        </div>
        {dayTasks.length > 0 && (
          <div className="text-xs text-gray-600 truncate max-w-12 text-center">
            {dayTasks[0].title}
          </div>
        )}
      </div>
    );
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold min-w-0">
              {formatDateHeader()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
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
                className="px-3 py-1 text-xs"
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="px-3 py-1 text-xs"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="px-3 py-1 text-xs"
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Section - Now 75% width and much larger */}
        <div className="flex-1 p-6" style={{ flex: '0 0 75%' }}>
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              <div className="h-full" style={{ minHeight: '700px' }}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full h-full"
                  classNames={{
                    months: "flex flex-col space-y-4 h-full",
                    month: "space-y-4 flex-1",
                    table: "w-full border-collapse h-full",
                    head_row: "flex mb-4",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-sm text-center py-2",
                    row: "flex flex-1 mt-2",
                    cell: "flex-1 text-center text-sm p-2 relative border border-gray-100 min-h-[120px] hover:bg-gray-50",
                    day: "h-full w-full flex flex-col items-start justify-start p-2 font-normal hover:bg-transparent",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "text-muted-foreground opacity-50",
                  }}
                  components={{
                    DayContent: ({ date }) => (
                      <div className="relative w-full h-full flex flex-col">
                        <span className="text-sm font-medium mb-2">{date.getDate()}</span>
                        <div className="flex-1 w-full">
                          {getTasksForDate(date).slice(0, 3).map((task, index) => (
                            <div
                              key={task.id}
                              className={`text-xs px-2 py-1 mb-1 rounded truncate cursor-pointer ${
                                task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                task.status === 'due_soon' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task);
                              }}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {getTasksForDate(date).length > 3 && (
                            <div className="text-xs text-gray-500 px-2">
                              +{getTasksForDate(date).length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Now 25% width */}
        <div className="p-6 space-y-6" style={{ flex: '0 0 25%', minWidth: '300px' }}>
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
                        className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
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
                        className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getStatusIcon(task.status)}</span>
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

      {/* Task Details Panel */}
      <div className="border-t bg-white">
        <div className="px-6 py-4">
          <Card>
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
