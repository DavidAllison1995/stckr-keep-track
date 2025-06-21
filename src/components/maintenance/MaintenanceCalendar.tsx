
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { tasks, generateVirtualTasks } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  // Generate virtual tasks for the current month view
  const calendarTasks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Combine real tasks with virtual recurring tasks
    const realTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
    
    const virtualTasks = generateVirtualTasks(monthStart, monthEnd);
    
    return [...realTasks, ...virtualTasks];
  }, [tasks, currentMonth, generateVirtualTasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return calendarTasks.filter(task => task.date === dateStr);
  }, [selectedDate, calendarTasks]);

  // Create date modifiers for the calendar
  const taskDates = useMemo(() => {
    const dates: { [key: string]: Date[] } = {
      overdue: [],
      dueSoon: [],
      completed: [],
      pending: [],
    };

    calendarTasks.forEach(task => {
      const taskDate = new Date(task.date);
      
      switch (task.status) {
        case 'overdue':
          dates.overdue.push(taskDate);
          break;
        case 'due_soon':
          dates.dueSoon.push(taskDate);
          break;
        case 'completed':
          dates.completed.push(taskDate);
          break;
        case 'pending':
        case 'in_progress':
          dates.pending.push(taskDate);
          break;
      }
    });

    return dates;
  }, [calendarTasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, isVirtual?: boolean) => {
    const baseClass = isVirtual ? 'opacity-60 border-dashed' : '';
    
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive" className={baseClass}>Overdue</Badge>;
      case 'due_soon':
        return <Badge className={`bg-yellow-500 text-white ${baseClass}`}>Due Soon</Badge>;
      case 'completed':
        return <Badge variant="secondary" className={baseClass}>Completed</Badge>;
      case 'in_progress':
        return <Badge className={`bg-blue-500 text-white ${baseClass}`}>In Progress</Badge>;
      default:
        return <Badge variant="outline" className={baseClass}>Pending</Badge>;
    }
  };

  const handleTaskClick = (task: any) => {
    if (task.virtual || !task.item_id) return; // Don't navigate for virtual tasks
    onNavigateToItem?.(task.item_id, task.id);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          Maintenance Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  overdue: taskDates.overdue,
                  dueSoon: taskDates.dueSoon,
                  completed: taskDates.completed,
                  pending: taskDates.pending,
                }}
                modifiersStyles={{
                  overdue: { backgroundColor: '#fee2e2', color: '#dc2626' },
                  dueSoon: { backgroundColor: '#fef3c7', color: '#d97706' },
                  completed: { backgroundColor: '#dcfce7', color: '#16a34a' },
                  pending: { backgroundColor: '#f3f4f6', color: '#6b7280' },
                }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Task Details for Selected Date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tasks scheduled for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task, index) => {
                    const assignedItem = task.item_id ? getItemById(task.item_id) : null;
                    
                    return (
                      <div
                        key={`${task.id}-${index}`}
                        className={`p-3 border rounded-lg space-y-2 ${
                          task.virtual 
                            ? 'border-dashed bg-gray-50 cursor-default' 
                            : 'cursor-pointer hover:bg-gray-50'
                        }`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <span className="font-medium text-sm">{task.title}</span>
                            {task.virtual && (
                              <Badge variant="outline" className="text-xs">
                                Future
                              </Badge>
                            )}
                          </div>
                          {getStatusBadge(task.status, task.virtual)}
                        </div>
                        
                        {task.notes && (
                          <p className="text-xs text-gray-600">{task.notes}</p>
                        )}
                        
                        {assignedItem && (
                          <p className="text-xs text-blue-600">
                            📦 {assignedItem.name}
                          </p>
                        )}
                        
                        {task.recurrence !== 'none' && (
                          <p className="text-xs text-gray-500">
                            🔄 Repeats {task.recurrence}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
