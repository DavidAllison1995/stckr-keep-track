
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { useDragScroll } from '@/hooks/useDragScroll';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

const Dashboard = ({ onTabChange }: DashboardProps) => {
  const { user } = useSupabaseAuth();
  const { items } = useSupabaseItems();
  const { tasks, getTasksByStatus } = useSupabaseMaintenance();
  const navigate = useNavigate();
  const { getDragProps, isDragActive } = useDragScroll();

  const overdueTasks = getTasksByStatus('overdue');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const inProgressTasks = getTasksByStatus('in_progress');
  const pendingTasks = getTasksByStatus('pending');
  
  const upcomingTasks = [...overdueTasks, ...dueSoonTasks, ...inProgressTasks, ...pendingTasks];
  
  const upToDateTasks = getTasksByStatus('pending').filter(task => {
    const taskDate = new Date(task.date);
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return taskDate > fourteenDaysFromNow;
  });

  const getThisWeekTasks = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const thisWeekTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });

    const tasksByDay = new Map();
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    daysOfWeek.forEach(day => tasksByDay.set(day, []));
    
    thisWeekTasks.forEach(task => {
      const taskDate = parseISO(task.date);
      const dayName = format(taskDate, 'EEEE');
      const existingTasks = tasksByDay.get(dayName) || [];
      tasksByDay.set(dayName, [...existingTasks, task]);
    });

    const daysWithTasks = Array.from(tasksByDay.entries())
      .map(([day, dayTasks]) => ({
        day,
        count: dayTasks.length,
        tasks: dayTasks
      }))
      .filter(({ count }) => count > 0);

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
    if (isDragActive()) return;
    navigate(`/items/${itemId}`);
  };

  const handleDayClick = () => {
    navigate('/maintenance');
  };

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

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
    <div className="max-w-6xl mx-auto mobile-padding">
      {/* Mobile-optimized Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="mobile-text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}!
        </h1>
      </div>

      {/* Mobile-first Layout */}
      <div className="space-y-6">
        {/* Recent Items Section - Mobile Optimized */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between mobile-text-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Recent Items</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleItemsClick}
                className="mobile-text-sm"
              >
                <span className="hidden sm:inline">View All</span>
                <ChevronRight className="w-4 h-4 sm:hidden" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-spacing">
            {items.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-2">📦</div>
                <p className="text-gray-600 mb-4 mobile-text-base">No items yet</p>
                <Button onClick={handleItemsClick} className="mobile-btn">
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 3).map((item) => {
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
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors touch-target"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-lg sm:text-xl">📦</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium mobile-text-base truncate">{item.name}</div>
                          <div className="mobile-text-sm text-gray-500">Status: Good</div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          maintenanceStatus === "Overdue" ? "destructive" : 
                          maintenanceStatus === "Due soon" ? "secondary" : 
                          "outline"
                        }
                        className="ml-2 flex-shrink-0 mobile-text-sm"
                      >
                        <span className="hidden sm:inline">{maintenanceStatus}</span>
                        <span className="sm:hidden">{maintenanceStatus === "Overdue" ? "!" : maintenanceStatus === "Due soon" ? "⚠" : "✓"}</span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile-optimized Calendar Section */}
        <Card 
          className="shadow-lg border-0 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={handleCalendarClick}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center mobile-text-lg">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Horizontal scrollable week view */}
            <div className="sm:hidden">
              <div 
                {...getDragProps()}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                style={{ 
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {thisWeekTasksData.map((dayData, index) => {
                  const colors = dayData.count > 0 ? getColorForIndex(index) : { bg: 'bg-gray-300', text: 'text-gray-600' };
                  return (
                    <div 
                      key={dayData.day}
                      className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={handleDayClick}
                    >
                      <span className="mobile-text-sm font-medium">{dayData.day.slice(0, 3)}</span>
                      <div className={`w-8 h-8 ${colors.bg} rounded-full ${colors.text} text-xs flex items-center justify-center font-medium`}>
                        {dayData.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Vertical list */}
            <div className="hidden sm:block space-y-3">
              {thisWeekTasksData.map((dayData, index) => {
                const colors = dayData.count > 0 ? getColorForIndex(index) : { bg: 'bg-gray-300', text: 'text-gray-600' };
                return (
                  <div 
                    key={dayData.day}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors touch-target"
                    onClick={handleDayClick}
                  >
                    <span className="text-sm">{dayData.day.slice(0, 3)}</span>
                    <div className={`w-6 h-6 ${colors.bg} rounded ${colors.text} text-xs flex items-center justify-center`}>
                      {dayData.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-optimized Quick Stats */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center mobile-text-lg">
              <Wrench className="mr-2 h-5 w-5 text-blue-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-spacing">
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors touch-target"
              onClick={handleItemsClick}
            >
              <span className="mobile-text-base text-gray-600">Total Items</span>
              <span className="font-medium mobile-text-base">{items.length}</span>
            </div>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors touch-target"
              onClick={() => handleTaskStatusClick('due-soon')}
            >
              <span className="mobile-text-base text-gray-600">Due Soon</span>
              <span className="font-medium text-yellow-600 mobile-text-base">{dueSoonTasks.length}</span>
            </div>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors touch-target"
              onClick={() => handleTaskStatusClick('overdue')}
            >
              <span className="mobile-text-base text-gray-600">Overdue</span>
              <span className="font-medium text-red-600 mobile-text-base">{overdueTasks.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
