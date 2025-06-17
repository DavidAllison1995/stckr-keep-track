
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';
import MaintenanceTaskForm from './MaintenanceTaskForm';

type StatusFilter = 'all' | 'overdue' | 'due_soon' | 'up_to_date';

interface MaintenanceCalendarProps {
  onNavigateToItem?: (itemId: string, taskId?: string) => void;
}

const MaintenanceCalendar = ({ onNavigateToItem }: MaintenanceCalendarProps) => {
  const { tasks, getTasksByStatus } = useMaintenance();
  const { getItemById } = useItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const overdueTasks = getTasksByStatus('overdue');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const upToDateTasks = getTasksByStatus('up_to_date');

  const filteredTasks = statusFilter === 'all' ? tasks : getTasksByStatus(statusFilter);

  const navigateToItem = (itemId: string, taskId?: string) => {
    if (onNavigateToItem) {
      onNavigateToItem(itemId, taskId);
    } else {
      // Default behavior - log for now
      console.log('Navigate to item:', itemId, 'task:', taskId);
    }
  };

  const handleTaskClick = (task: any) => {
    if (task.itemId) {
      navigateToItem(task.itemId, task.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`border-red-200 bg-red-50 cursor-pointer transition-all ${
                  statusFilter === 'overdue' ? 'ring-2 ring-red-500' : 'hover:shadow-md'
                }`}
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Overdue</p>
                      <p className="text-2xl font-bold text-red-900">{overdueTasks.length}</p>
                    </div>
                    <div className="text-red-500 text-2xl">⚠️</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border-yellow-200 bg-yellow-50 cursor-pointer transition-all ${
                  statusFilter === 'due_soon' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'
                }`}
                onClick={() => setStatusFilter(statusFilter === 'due_soon' ? 'all' : 'due_soon')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Due Soon</p>
                      <p className="text-2xl font-bold text-yellow-900">{dueSoonTasks.length}</p>
                    </div>
                    <div className="text-yellow-500 text-2xl">⏰</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border-green-200 bg-green-50 cursor-pointer transition-all ${
                  statusFilter === 'up_to_date' ? 'ring-2 ring-green-500' : 'hover:shadow-md'
                }`}
                onClick={() => setStatusFilter(statusFilter === 'up_to_date' ? 'all' : 'up_to_date')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Up to Date</p>
                      <p className="text-2xl font-bold text-green-900">{upToDateTasks.length}</p>
                    </div>
                    <div className="text-green-500 text-2xl">✅</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {statusFilter === 'all' ? 'All Tasks' : 
                     statusFilter === 'overdue' ? 'Overdue Tasks' :
                     statusFilter === 'due_soon' ? 'Due Soon Tasks' : 'Up to Date Tasks'}
                  </CardTitle>
                  {statusFilter !== 'all' && (
                    <Button variant="outline" size="sm" onClick={() => setStatusFilter('all')}>
                      Show All
                    </Button>
                  )}
                </div>
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
                  <div className="space-y-3">
                    {filteredTasks.map((task) => {
                      const assignedItem = task.itemId ? getItemById(task.itemId) : null;
                      return (
                        <Button
                          key={task.id}
                          variant="ghost"
                          className="w-full justify-start p-0 h-auto hover:bg-gray-100"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center gap-3 p-3 w-full">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'overdue' ? 'bg-red-500' :
                              task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-gray-600">Due: {new Date(task.date).toLocaleDateString()}</div>
                              {assignedItem && (
                                <div className="text-sm text-blue-600">📦 {assignedItem.name}</div>
                              )}
                              {task.notes && (
                                <div className="text-sm text-gray-500">{task.notes}</div>
                              )}
                            </div>
                            <div className={`px-2 py-1 text-xs rounded-full ${
                              task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              task.status === 'due_soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {task.status === 'overdue' ? 'Overdue' :
                               task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-600">Calendar functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceCalendar;
