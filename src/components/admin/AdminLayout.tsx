
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Shield, 
  LayoutDashboard, 
  QrCode, 
  Store, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { profile, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'QR Codes', href: '/admin/qr', icon: QrCode },
    { name: 'Shop', href: '/admin/shop', icon: Store },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-panel">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-950 shadow-large border-r border-gray-800">
            <SidebarContent 
              navigationItems={navigationItems}
              location={location}
              profile={profile}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent 
          navigationItems={navigationItems}
          location={location}
          profile={profile}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-900 shadow-soft border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <span className="font-semibold text-gray-100">Admin Portal</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Page content */}
        <main className="p-6 bg-gray-950 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigationItems: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  location: { pathname: string };
  profile: any;
  onLogout: () => void;
  onClose?: () => void;
}

const SidebarContent = ({ navigationItems, location, profile, onLogout, onClose }: SidebarContentProps) => (
  <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-purple-400" />
        <span className="text-xl font-bold text-gray-100">Admin Portal</span>
      </div>
      {onClose && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-purple-600 text-white shadow-medium'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="p-4 border-t border-gray-800 space-y-4">
      <div className="hidden lg:block">
        <ThemeToggle />
      </div>
      
      <Card className="p-4 bg-gray-900 border-gray-700">
        <div className="text-sm">
          <p className="font-medium text-gray-100">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-gray-400">Administrator</p>
        </div>
      </Card>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-600"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  </div>
);

export default AdminLayout;
