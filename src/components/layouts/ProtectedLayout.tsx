
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Menu, 
  X,
  ShoppingCart
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import NavBar from '@/components/navigation/NavBar';
import { useCart } from '@/contexts/CartContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { getCartItemCount } = useCart();

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

  const cartItemCount = getCartItemCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-optimized Header */}
      <div className="mobile-padding pt-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="hover:opacity-80 transition-opacity touch-target"
              >
                <img 
                  src="/lovable-uploads/1593d98b-ef6a-4e85-abb0-468737d7717b.png" 
                  alt="STCKR Icon" 
                  className="h-12 sm:h-16 cursor-pointer"
                />
              </button>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationBell />
              
              {/* Cart Icon with Badge */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/shop')}
                className="relative p-2 touch-target"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2 touch-target"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Content with mobile-optimized spacing */}
          <main className="p-4 sm:p-6 pb-20 sm:pb-24">
            {children}
          </main>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default ProtectedLayout;
