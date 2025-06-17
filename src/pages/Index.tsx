import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import ItemsList from '@/components/items/ItemsList';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import QRScanner from '@/components/qr/QRScanner';
import Profile from '@/components/profile/Profile';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
            <div className="p-6 pb-8">
              <TabsContent value="dashboard" className="mt-0">
                <Dashboard />
              </TabsContent>
              <TabsContent value="items" className="mt-0">
                <ItemsList />
              </TabsContent>
              <TabsContent value="maintenance" className="mt-0">
                <MaintenanceCalendar />
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
