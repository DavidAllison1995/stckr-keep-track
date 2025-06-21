import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  Calendar, 
  QrCode, 
  User, 
  Menu, 
  X,
  Settings,
  Wrench
} from 'lucide-react';
import { useGlobalQRScanner } from '@/hooks/useQrScanner';
import GlobalQRScannerOverlay from '@/components/qr/GlobalQRScannerOverlay';
import NotificationBell from '@/components/notifications/NotificationBell';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isScanning, handleGlobalScan, stopGlobalScan } = useGlobalQRScanner();

  useEffect(() => {
    if (!isSidebarOpen) return;

    const closeSidebar = () => {
      setIsSidebarOpen(false);
    };

    document.addEventListener('mousedown', closeSidebar);

    return () => {
      document.removeEventListener('mousedown', closeSidebar);
    };
  }, [isSidebarOpen]);

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/') return 'Dashboard';
    if (path.startsWith('/items')) return 'Items';
    if (path.startsWith('/maintenance')) return 'Maintenance';
    if (path.startsWith('/calendar')) return 'Calendar';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/admin')) return 'Admin';

    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;

    if (path === '/') return 'Overview of your home';
    if (path.startsWith('/items')) return 'Manage your items';
    if (path.startsWith('/maintenance')) return 'Track maintenance tasks';
    if (path.startsWith('/calendar')) return 'View your calendar';

    return 'Manage your account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {getPageDescription()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalScan}
                className="p-2"
              >
                <QrCode className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Desktop Sidebar & Content */}
          <div className="lg:flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 p-4 border-r dark:border-gray-700">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/items')}>
                  <Package className="w-4 h-4 mr-2" />
                  Items
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/maintenance')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Maintenance
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/calendar')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex lg:hidden">
          <aside className="bg-white dark:bg-gray-800 w-64 h-full flex-shrink-0 transform translate-x-0 transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/'); setIsSidebarOpen(false); }}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/items'); setIsSidebarOpen(false); }}>
                <Package className="w-4 h-4 mr-2" />
                Items
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/maintenance'); setIsSidebarOpen(false); }}>
                <Wrench className="w-4 h-4 mr-2" />
                Maintenance
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/calendar'); setIsSidebarOpen(false); }}>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/settings'); setIsSidebarOpen(false); }}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
          </aside>
        </div>
      )}

      {/* Scanner Overlay */}
      <GlobalQRScannerOverlay
        isScanning={isScanning}
        onStop={stopGlobalScan}
      />
    </div>
  );
};

export default ProtectedLayout;
