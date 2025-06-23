
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

const Dashboard = ({ onTabChange }: DashboardProps) => {
  const { user } = useSupabaseAuth();
  const { items } = useSupabaseItems();
  const { tasks, getTasksByStatus } = useSupabaseMaintenance();
  const navigate = useNavigate();

  const overdueTasks = getTasksByStatus('overdue');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const inProgressTasks = getTasksByStatus('in_progress');
  const pendingTasks = getTasksByStatus('pending');
  
  // Calculate upcoming (non-completed) tasks
  const upcomingTasks = [...overdueTasks, ...dueSoonTasks, ...inProgressTasks, ...pendingTasks];
  
  // For up-to-date tasks, we need to filter pending tasks that are due more than 14 days from now
  const upToDateTasks = getTasksByStatus('pending').filter(task => {
    const taskDate = new Date(task.date);
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return taskDate > fourteenDaysFromNow;
  });

  // Calculate this week's tasks
  const getThisWeekTasks = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    
    // Get all non-completed tasks for this week
    const thisWeekTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });

    // Group tasks by day
    const tasksByDay = new Map();
    
    // Initialize all days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    daysOfWeek.forEach(day => tasksByDay.set(day, []));
    
    // Group tasks by day name
    thisWeekTasks.forEach(task => {
      const taskDate = parseISO(task.date);
      const dayName = format(taskDate, 'EEEE'); // Full day name
      const existingTasks = tasksByDay.get(dayName) || [];
      tasksByDay.set(dayName, [...existingTasks, task]);
    });

    // Convert to array and filter days with tasks (or show default days if no tasks)
    const daysWithTasks = Array.from(tasksByDay.entries())
      .map(([day, dayTasks]) => ({
        day,
        count: dayTasks.length,
        tasks: dayTasks
      }))
      .filter(({ count }) => count > 0);

    // If no tasks this week, show default days with 0 counts
    if (daysWithTasks.length === 0) {
      return [
        { day: 'Monday', count: 0, tasks: [] },
        { day: 'Wednesday', count: 0, tasks: [] },
        { day: 'Friday', count: 0, tasks: [] }
      ];
    }

    return daysWithTasks;
  };

  const thisWeekTasksData = getThisWeekTasks();

  const handleItemsClick = () => {
    navigate('/items');
  };

  const handleMaintenanceClick = () => {
    navigate('/maintenance');
  };

  const handleCalendarClick = () => {
    navigate('/maintenance');
  };

  const handleTaskStatusClick = (status: string) => {
    navigate(`/tasks/${status}`);
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleDayClick = () => {
    // Navigate to maintenance calendar view
    navigate('/maintenance');
  };

  // Get user's first name from metadata or email
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  // Color mapping for day tiles
  const getColorForIndex = (index: number) => {
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-orange-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' },
      { bg: 'bg-pink-500', text: 'text-white' }
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}!
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Items List */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Recent Items</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleItemsClick}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-600 mb-4">No items yet</p>
                  <Button onClick={handleItemsClick}>Add Your First Item</Button>
                </div>
              ) : (
                items.slice(0, 3).map((item) => {
                  const itemTasks = tasks.filter(task => task.item_id === item.id && task.status !== 'completed');
                  const hasOverdue = itemTasks.some(task => new Date(task.date) < new Date() && task.status !== 'completed');
                  const hasDueSoon = itemTasks.some(task => {
                    const taskDate = new Date(task.date);
                    const now = new Date();
                    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                    return taskDate >= now && taskDate <= fourteenDaysFromNow;
                  });
                  
                  const maintenanceStatus = hasOverdue ? 'Overdue' : hasDueSoon ? 'Due soon' : 'Up to date';
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">Status: Good</div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          maintenanceStatus === "Overdue" ? "destructive" : 
                          maintenanceStatus === "Due soon" ? "secondary" : 
                          "outline"
                        }
                      >
                        {maintenanceStatus}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Maintenance Calendar */}
          <Card 
            className="shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={handleCalendarClick}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {thisWeekTasksData.map((dayData, index) => {
                const colors = dayData.count > 0 ? getColorForIndex(index) : { bg: 'bg-gray-300', text: 'text-gray-600' };
                return (
                  <div 
                    key={dayData.day}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                    onClick={handleDayClick}
                  >
                    <span className="text-sm">{dayData.day.slice(0, 3)}</span>
                    <div className={`w-6 h-6 ${colors.bg} rounded ${colors.text} text-xs flex items-center justify-center`}>
                      {dayData.count}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Wrench className="mr-2 h-5 w-5 text-blue-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={handleItemsClick}
              >
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleTaskStatusClick('due-soon')}
              >
                <span className="text-sm text-gray-600">Due Soon</span>
                <span className="font-medium text-yellow-600">{dueSoonTasks.length}</span>
              </div>
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleTaskStatusClick('overdue')}
              >
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">{overdueTasks.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
