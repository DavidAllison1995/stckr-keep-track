
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAdminAuth();

  console.log('AdminProtectedRoute check:', {
    isAuthenticated,
    isAdmin,
    isLoading,
    userEmail: user?.email
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    console.log('User is authenticated but not admin:', user?.email);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p><strong>Access Denied</strong></p>
                <p>You don't have administrator privileges to access this area.</p>
                <p className="text-sm">Logged in as: {user?.email}</p>
                <p className="text-sm">
                  If you believe this is an error, please contact your system administrator.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  console.log('Admin access granted for:', user?.email);
  return <>{children}</>;
};

export default AdminProtectedRoute;
