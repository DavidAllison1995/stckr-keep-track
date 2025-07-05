import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench, QrCode } from 'lucide-react';
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
    navigate('/calendar');
  };

  const handleCalendarClick = () => {
    navigate('/calendar');
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
      {/* Enhanced Header */}
      <div className="text-center mb-12 mobile-tight-space pt-6 mobile-compact-py">
        <div className="inline-flex items-center mobile-tight-gap gap-3 mb-4 px-6 mobile-compact-px py-4 mobile-compact-py bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
          <div className="w-8 h-8 mobile-icon-md bg-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
            <QrCode className="w-5 h-5 mobile-icon-sm text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl mobile-text-sm font-extrabold text-white tracking-tight">
            👋 Welcome back,{' '}
            <span 
              className="text-purple-400 bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(147, 51, 234, 0.3)'
              }}
            >
              {userName}!
            </span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg mobile-text-xs font-medium">
          Let's manage your space.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 mobile-tight-gap gap-6">
        {/* Main Content - Items List */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-gray-800 bg-gray-900">
            <CardHeader className="mobile-compact-p">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center mobile-tight-gap gap-3">
                  <Package className="w-5 h-5 mobile-icon-md text-purple-400" />
                  <span className="text-white mobile-text-sm">Recent Items</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleItemsClick} className="text-purple-400 hover:text-purple-300 hover:bg-gray-800 mobile-compact-px">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mobile-tight-space mobile-compact-p">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-400 mb-4">No items yet</p>
                  <Button onClick={handleItemsClick} className="bg-purple-600 hover:bg-purple-700">Add Your First Item</Button>
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
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg flex items-center justify-center">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-sm text-gray-400">Status: Good</div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          maintenanceStatus === "Overdue" ? "destructive" : 
                          maintenanceStatus === "Due soon" ? "secondary" : 
                          "outline"
                        }
                        className={
                          maintenanceStatus === "Overdue" ? "bg-red-900/50 text-red-300" :
                          maintenanceStatus === "Due soon" ? "bg-amber-900/50 text-amber-300" :
                          "bg-gray-800 text-gray-300 border-gray-600"
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
        <div className="space-y-6 mobile-tight-space">
          {/* Calendar */}
          <Card 
            className="shadow-xl border-gray-800 bg-gray-900 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-purple-500/30"
            onClick={handleCalendarClick}
          >
            <CardHeader className="mobile-compact-p">
              <CardTitle className="flex items-center text-lg mobile-text-sm mobile-tight-gap">
                <Calendar className="mr-2 h-5 w-5 mobile-icon-md text-purple-400" />
                <span className="text-white">This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 mobile-tight-space mobile-compact-p">
              {thisWeekTasksData.map((dayData, index) => {
                const colors = dayData.count > 0 ? getColorForIndex(index) : { bg: 'bg-gray-700', text: 'text-gray-400' };
                return (
                  <div 
                    key={dayData.day}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-1 rounded transition-colors"
                    onClick={handleDayClick}
                  >
                    <span className="text-sm text-gray-300">{dayData.day.slice(0, 3)}</span>
                    <div className={`w-6 h-6 ${colors.bg} rounded ${colors.text} text-xs flex items-center justify-center`}>
                      {dayData.count}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-xl border-gray-800 bg-gray-900">
            <CardHeader className="mobile-compact-p">
              <CardTitle className="flex items-center text-lg mobile-text-sm mobile-tight-gap">
                <Wrench className="mr-2 h-5 w-5 mobile-icon-md text-purple-400" />
                <span className="text-white">Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 mobile-tight-space mobile-compact-p">
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={handleItemsClick}
              >
                <span className="text-sm text-gray-400">Total Items</span>
                <span className="font-medium text-white">{items.length}</span>
              </div>
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={() => handleTaskStatusClick('due-soon')}
              >
                <span className="text-sm text-gray-400">Due Soon</span>
                <span className="font-medium text-amber-400">{dueSoonTasks.length}</span>
              </div>
              <div 
                className="flex justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={() => handleTaskStatusClick('overdue')}
              >
                <span className="text-sm text-gray-400">Overdue</span>
                <span className="font-medium text-red-400">{overdueTasks.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
