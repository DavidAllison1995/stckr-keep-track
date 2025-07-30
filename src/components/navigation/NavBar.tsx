
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialModal from '@/components/tutorial/TutorialModal';

const NavBar = () => {
  const location = useLocation();
  const [showTutorial, setShowTutorial] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/items', label: 'Items', icon: '📦' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/scanner', label: 'Scan', icon: '📱' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 z-50">
        <div className="flex w-full h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                isActive(item.path) 
                  ? "text-purple-400" 
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                isActive(item.path) 
                  ? "bg-purple-600" 
                  : "bg-gray-600 hover:bg-gray-500"
              )}>
                <span className="text-white text-xs">{item.icon}</span>
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Help/Tutorial Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTutorial(true)}
        className="fixed top-4 right-4 z-40 bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Tutorial
      </Button>

      <TutorialModal open={showTutorial} onOpenChange={setShowTutorial} />
    </>
  );
};

export default NavBar;
