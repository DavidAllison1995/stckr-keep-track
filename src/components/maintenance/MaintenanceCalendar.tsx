
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Download, Edit } from 'lucide-react';
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

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500 text-white';
      case 'due_soon': return 'bg-yellow-500 text-white';
      case 'up_to_date': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Custom day content for calendar with task titles
  const renderDayContent = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="absolute inset-0 top-6 px-1 space-y-1">
        {dayTasks.slice(0, 2).map((task) => (
          <div
            key={task.id}
            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${getStatusColor(task.status)}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTaskClick(task);
            }}
            title={task.title}
          >
            {task.title.length > 12 ? `${task.title.substring(0, 12)}...` : task.title}
          </div>
        ))}
        {dayTasks.length > 2 && (
          <div className="text-xs text-gray-600 font-medium">
            +{dayTasks.length - 2} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Calendar View */}
      <Card className="h-[70vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border h-full"
            components={{
              DayContent: ({ date }) => (
                <div className="relative w-full h-16">
                  <span className="absolute top-1 left-1 text-sm">{date.getDate()}</span>
                  {renderDayContent(date)}
                </div>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Task List Below Calendar */}
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
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                    return (
                      <TableRow
                        key={task.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTaskClick(task)}
                      >
                        <TableCell>{new Date(task.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          {assignedItem ? (
                            <span className="text-blue-600">📦 {assignedItem.name}</span>
                          ) : (
                            <span className="text-gray-500">No item assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            task.status === 'due_soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {task.status === 'overdue' ? 'Overdue' :
                             task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleExportToCalendar(task, e)}
                              className="p-1"
                              title="Add to Calendar"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement edit functionality
                                console.log('Edit task:', task.id);
                              }}
                              className="p-1"
                              title="Edit Task"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceCalendar;
