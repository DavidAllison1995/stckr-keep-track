
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import ItemsList from '@/components/items/ItemsList';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import QRScanner from '@/components/qr/QRScanner';
import Profile from '@/components/profile/Profile';
import ItemDetail from '@/components/items/ItemDetail';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const { getItemById } = useItems();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemDetailTab, setItemDetailTab] = useState('details');
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'items') {
      setSelectedItemId(null);
    }
  };

  const handleNavigateToItem = (itemId: string, taskId?: string) => {
    setSelectedItemId(itemId);
    setItemDetailTab('maintenance');
    setHighlightTaskId(taskId || null);
    setActiveTab('items');
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setItemDetailTab('details');
    setHighlightTaskId(null);
  };

  const handleCloseItemDetail = () => {
    setSelectedItemId(null);
    setHighlightTaskId(null);
  };

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const selectedItem = selectedItemId ? getItemById(selectedItemId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
            <div className="p-6 pb-8">
              <TabsContent value="dashboard" className="mt-0">
                <Dashboard onTabChange={handleTabChange} />
              </TabsContent>
              <TabsContent value="items" className="mt-0">
                {selectedItem ? (
                  <ItemDetail 
                    item={selectedItem} 
                    onClose={handleCloseItemDetail}
                    defaultTab={itemDetailTab}
                    highlightTaskId={highlightTaskId}
                  />
                ) : (
                  <ItemsList onItemSelect={handleItemSelect} />
                )}
              </TabsContent>
              <TabsContent value="maintenance" className="mt-0">
                <MaintenanceCalendar onNavigateToItem={handleNavigateToItem} />
              </TabsContent>
              <TabsContent value="scanner" className="mt-0">
                <QRScanner />
              </TabsContent>
              <TabsContent value="profile" className="mt-0">
                <Profile />
              </TabsContent>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <TabsList className="w-full h-16 bg-transparent p-0">
            <TabsTrigger value="dashboard" className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🏠</span>
              </div>
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📦</span>
              </div>
              <span className="text-xs">Items</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔧</span>
              </div>
              <span className="text-xs">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📱</span>
              </div>
              <span className="text-xs">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👤</span>
              </div>
              <span className="text-xs">Profile</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;
