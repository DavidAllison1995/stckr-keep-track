
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Menu, 
  X
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/d82e8cb1-7c45-4ae2-8300-4cd24e786985.png" 
                  alt="STCKR Logo" 
                  className="h-16 cursor-pointer"
                />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
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
    </div>
  );
};

export default ProtectedLayout;
