
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';
import MaintenanceTaskForm from './MaintenanceTaskForm';
import { generateICSFile } from '@/utils/calendarExport';

type StatusFilter = 'all' | 'overdue' | 'due_soon' | 'up_to_date';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const { tasks, getTasksByStatus } = useMaintenance();
  const { getItemById } = useItems();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const overdueTasks = getTasksByStatus('overdue');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const upToDateTasks = getTasksByStatus('up_to_date');

  const filteredTasks = statusFilter === 'all' ? tasks : getTasksByStatus(statusFilter);

  const navigateToItem = (itemId: string, taskId?: string) => {
    if (onNavigateToItem) {
      onNavigateToItem(itemId, taskId);
    } else {
      console.log('Navigate to item:', itemId, 'task:', taskId);
    }
  };

  const handleTaskClick = (task: any) => {
    if (task.itemId) {
      navigateToItem(task.itemId, task.id);
    }
  };

  const handleExportToCalendar = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
    generateICSFile(task, assignedItem?.name);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => task.date.startsWith(dateStr));
  };

  // Custom day content for calendar
  const renderDayContent = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        <div className="flex gap-1">
          {dayTasks.slice(0, 3).map((task, index) => (
            <div
              key={task.id}
              className={`w-1.5 h-1.5 rounded-full ${
                task.status === 'overdue' ? 'bg-red-500' :
                task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          ))}
          {dayTasks.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Tasks</h1>
          <p className="text-gray-600">Track and schedule your maintenance tasks</p>
        </div>
        <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <span className="mr-2">+</span>
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Task</DialogTitle>
            </DialogHeader>
            <MaintenanceTaskForm onSuccess={() => setIsAddTaskModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          className="flex items-center gap-2"
        >
          All Tasks
          <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
            {tasks.length}
          </span>
        </Button>
        <Button
          variant={statusFilter === 'overdue' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('overdue')}
          className="flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Overdue
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
            {overdueTasks.length}
          </span>
        </Button>
        <Button
          variant={statusFilter === 'due_soon' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('due_soon')}
          className="flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          Due Soon
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            {dueSoonTasks.length}
          </span>
        </Button>
        <Button
          variant={statusFilter === 'up_to_date' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('up_to_date')}
          className="flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Up to Date
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            {upToDateTasks.length}
          </span>
        </Button>
      </div>

      {/* Main Content - Calendar and Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => (
                  <div className="relative w-full h-full">
                    <span>{date.getDate()}</span>
                    {renderDayContent(date)}
                  </div>
                )
              }}
            />
            
            {/* Tasks for Selected Date */}
            {selectedDate && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">
                  Tasks for {selectedDate.toLocaleDateString()}
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getTasksForDate(selectedDate).map((task) => {
                    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'overdue' ? 'bg-red-500' :
                            task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium">{task.title}</div>
                            {assignedItem && (
                              <div className="text-xs text-blue-600">📦 {assignedItem.name}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleExportToCalendar(task, e)}
                          className="p-1"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {getTasksForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No tasks for this date
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task List Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === 'all' ? 'All Tasks' : 
               statusFilter === 'overdue' ? 'Overdue Tasks' :
               statusFilter === 'due_soon' ? 'Due Soon Tasks' : 'Up to Date Tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No maintenance tasks' : `No ${statusFilter.replace('_', ' ')} tasks`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter === 'all' ? 'Start by adding your first maintenance task' : 'Great! No tasks in this category.'}
                </p>
                {statusFilter === 'all' && (
                  <Button onClick={() => setIsAddTaskModalOpen(true)}>Add Your First Task</Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTasks.map((task) => {
                  const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'overdue' ? 'bg-red-500' :
                        task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">Due: {new Date(task.date).toLocaleDateString()}</div>
                        {assignedItem && (
                          <div className="text-sm text-blue-600">📦 {assignedItem.name}</div>
                        )}
                        {task.notes && (
                          <div className="text-sm text-gray-500">{task.notes}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          task.status === 'due_soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {task.status === 'overdue' ? 'Overdue' :
                           task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleExportToCalendar(task, e)}
                          className="p-1"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
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
  );
};

export default MaintenanceCalendar;
