import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench, Clock, AlertTriangle, CheckCircle2, QrCode, Check, X } from 'lucide-react';
import { getIconComponent } from '@/components/icons';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-medium">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="text-gray-600 text-lg">Manage your items and stay on top of maintenance</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Items Card Wall */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600" />
                Your Items
              </h2>
              <Button variant="outline" onClick={handleItemsClick} className="gap-2">
                View All Items
              </Button>
            </div>

            {/* Items Card Wall */}
            <div className="space-y-4">
              {items.length === 0 ? (
                <Card variant="elevated" className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-brand-gradient-subtle rounded-3xl flex items-center justify-center">
                    <Package className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No items yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start building your digital inventory by adding your first item
                  </p>
                  <Button onClick={handleItemsClick} className="gap-2 shadow-medium">
                    <Package className="w-4 h-4" />
                    Add Your First Item
                  </Button>
                </Card>
              ) : (
                items.slice(0, 6).map((item) => {
                  const itemTasks = tasks.filter(task => task.item_id === item.id && task.status !== 'completed');
                  const overdueTasks = itemTasks.filter(task => new Date(task.date) < new Date() && task.status !== 'completed');
                  const dueSoonTasks = itemTasks.filter(task => {
                    const taskDate = new Date(task.date);
                    const now = new Date();
                    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                    return taskDate >= now && taskDate <= fourteenDaysFromNow;
                  });
                  
                  const IconComponent = getIconComponent(item.icon_id || 'box');
                  
                  return (
                    <Card 
                      key={item.id}
                      variant="elevated"
                      className="cursor-pointer group hover:shadow-large hover:-translate-y-1 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Item Image/Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              {item.photo_url ? (
                                <img 
                                  src={item.photo_url} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover rounded-xl" 
                                />
                              ) : (
                                <IconComponent className="w-8 h-8 text-blue-600" />
                              )}
                            </div>
                          </div>
                          
                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Top Row - Name and Status Pills */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-blue-100 text-blue-800 border-blue-200 font-medium"
                                  >
                                    {item.category}
                                  </Badge>
                                  {item.room && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium"
                                    >
                                      {item.room}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={item.qr_code_id ? "success" : "secondary"}
                                    className={`font-medium ${
                                      item.qr_code_id 
                                        ? "bg-green-100 text-green-800 border-green-200" 
                                        : "bg-gray-100 text-gray-600 border-gray-200"
                                    }`}
                                  >
                                    <QrCode className="w-3 h-3 mr-1.5" />
                                    {item.qr_code_id ? 'QR Assigned' : 'No QR Code'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            
                            {/* Bottom Row - Maintenance Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {overdueTasks.length > 0 && (
                                  <Badge variant="error" className="gap-1.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    {overdueTasks.length} Overdue
                                  </Badge>
                                )}
                                {dueSoonTasks.length > 0 && (
                                  <Badge variant="warning" className="gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {dueSoonTasks.length} Due Soon
                                  </Badge>
                                )}
                                {overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
                                  <Badge variant="success" className="gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Up to Date
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Dates */}
                              <div className="text-xs text-gray-500 text-right">
                                {item.purchase_date && (
                                  <div>Purchased: {new Date(item.purchase_date).toLocaleDateString()}</div>
                                )}
                                {item.warranty_date && (
                                  <div>Warranty: {new Date(item.warranty_date).toLocaleDateString()}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* This Week Calendar Card */}
            <Card 
              variant="elevated"
              className="cursor-pointer hover:shadow-large hover:-translate-y-1 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              onClick={handleCalendarClick}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-brand-gradient-subtle rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold">This Week</div>
                    <div className="text-sm font-normal text-gray-600">Maintenance schedule</div>
                  </div>
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

            {/* Enhanced Quick Stats */}
            <Card 
              variant="elevated" 
              className="border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-brand-gradient-subtle rounded-xl">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold">Quick Stats</div>
                    <div className="text-sm font-normal text-gray-600">Overview</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100"
                  onClick={handleItemsClick}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Items</span>
                  </div>
                  <span className="font-bold text-blue-700 text-lg">{items.length}</span>
                </div>
                
                <div 
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl cursor-pointer hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 border border-yellow-100"
                  onClick={() => handleTaskStatusClick('due-soon')}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Due Soon</span>
                  </div>
                  <span className="font-bold text-yellow-700 text-lg">{dueSoonTasks.length}</span>
                </div>
                
                <div 
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl cursor-pointer hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-100"
                  onClick={() => handleTaskStatusClick('overdue')}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700">Overdue</span>
                  </div>
                  <span className="font-bold text-red-700 text-lg">{overdueTasks.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
