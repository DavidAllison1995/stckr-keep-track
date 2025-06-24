
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
import CartDrawer from '@/components/shop/CartDrawer';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getNewItemsCount, markCartAsViewed } = useCart();

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

  const newItemsCount = getNewItemsCount();

  const handleCartClick = () => {
    markCartAsViewed(); // Clear the badge when cart is opened
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="px-2 md:px-4 pt-2 md:pt-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-between p-3 md:p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/1593d98b-ef6a-4e85-abb0-468737d7717b.png" 
                  alt="STCKR Icon" 
                  className="h-12 md:h-16 cursor-pointer"
                />
              </button>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationBell />
              
              {/* Cart Icon with Badge */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartClick}
                className="relative p-2"
              >
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5" />
                {newItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 md:h-5 w-4 md:w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {newItemsCount > 9 ? '9+' : newItemsCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2"
              >
                <User className="w-4 md:w-5 h-4 md:h-5" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <main className="p-3 md:p-6 pb-16 md:pb-20">
            {children}
          </main>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <NavBar />
      
      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ProtectedLayout;
