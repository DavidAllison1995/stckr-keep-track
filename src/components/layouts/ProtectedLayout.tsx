
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Menu, 
  X,
  QrCode
} from 'lucide-react';
import { useGlobalQRScanner } from '@/hooks/useGlobalQRScanner';
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
          
          {/* Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Scanner Overlay */}
      <GlobalQRScannerOverlay
        isOpen={isScanning}
        onClose={stopGlobalScan}
        scannedCode={null}
      />
    </div>
  );
};

export default ProtectedLayout;
