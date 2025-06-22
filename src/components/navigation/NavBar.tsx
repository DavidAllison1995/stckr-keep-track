
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShop } from '@/hooks/useShop';
import { useState } from 'react';
import CartDrawer from '@/components/shop/CartDrawer';

const NavBar = () => {
  const location = useLocation();
  const { getCartItemCount } = useShop();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/items', label: 'Items', icon: '📦' },
    { path: '/maintenance', label: 'Calendar', icon: '📅' },
    { path: '/scanner', label: 'Scan', icon: '📱' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const cartItemCount = getCartItemCount();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex w-full h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                isActive(item.path) 
                  ? "text-blue-600" 
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isActive(item.path) 
                  ? "bg-blue-500" 
                  : "bg-gray-400"
              )}>
                <span className="text-white text-xs">{item.icon}</span>
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          
          {/* Cart Button */}
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="ghost"
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center relative">
              <ShoppingCart className="w-3 h-3 text-white" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 px-1 py-0 text-xs h-4 min-w-4"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-600">Cart</span>
          </Button>
        </div>
      </div>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default NavBar;
