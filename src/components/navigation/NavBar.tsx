
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NavBar = () => {
  const location = useLocation();
  
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 z-50 safe-area-padding">
      <div className="flex w-full h-16 sm:h-14">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors touch-target min-w-0 px-1",
              isActive(item.path) 
                ? "text-blue-600" 
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <div className={cn(
              "w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0",
              isActive(item.path) 
                ? "bg-blue-500" 
                : "bg-gray-400"
            )}>
              <span className="text-white text-xs">{item.icon}</span>
            </div>
            <span className="mobile-text-sm text-center truncate w-full">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
