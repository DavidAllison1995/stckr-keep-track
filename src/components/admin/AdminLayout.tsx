
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
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
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">Admin Portal</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Page content */}
        <main className="p-6">
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
  <div className="flex flex-col h-full bg-white border-r">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-bold">Admin Portal</span>
      </div>
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
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
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="p-4 border-t space-y-4">
      <div className="hidden lg:block">
        <ThemeToggle />
      </div>
      
      <Card className="p-3">
        <div className="text-sm">
          <p className="font-medium">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-gray-500">Administrator</p>
        </div>
      </Card>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="w-full"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  </div>
);

export default AdminLayout;
