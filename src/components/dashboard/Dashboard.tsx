
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { useMaintenance } from '@/hooks/useMaintenance';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

const Dashboard = ({ onTabChange }: DashboardProps) => {
  const { user } = useAuth();
  const { items } = useItems();
  const { tasks, getTasksByStatus } = useMaintenance();

  const overdueTasks = getTasksByStatus('overdue');
  const dueSoonTasks = getTasksByStatus('due_soon');
  const upToDateTasks = getTasksByStatus('up_to_date');

  const handleStatsClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your items</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors"
          onClick={() => handleStatsClick('items')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm opacity-90">Total Items</div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-colors"
          onClick={() => handleStatsClick('maintenance')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-sm opacity-90">Maintenance Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧</span>
            Maintenance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div 
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => handleStatsClick('maintenance')}
          >
            <div>
              <div className="font-semibold text-red-800">Overdue Tasks</div>
              <div className="text-sm text-red-600">{overdueTasks.length} items need attention</div>
            </div>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          </div>
          
          <div 
            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => handleStatsClick('maintenance')}
          >
            <div>
              <div className="font-semibold text-yellow-800">Due Soon</div>
              <div className="text-sm text-yellow-600">Next 14 days</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{dueSoonTasks.length}</div>
          </div>
          
          <div 
            className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleStatsClick('maintenance')}
          >
            <div>
              <div className="font-semibold text-green-800">Up to Date</div>
              <div className="text-sm text-green-600">Looking good!</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{upToDateTasks.length}</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📦</span>
              Recent Items
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleStatsClick('items')}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-600 mb-4">No items yet</p>
              <Button onClick={() => handleStatsClick('items')}>Add Your First Item</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleStatsClick('items')}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                  {item.room && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.room}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
