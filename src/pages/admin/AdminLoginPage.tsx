
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminLoginPage = () => {
  const { isAuthenticated, isAdmin, login, isLoading, profile, user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [attemptedLogin, setAttemptedLogin] = useState(false);

  console.log('AdminLoginPage render:', {
    isAuthenticated,
    isAdmin,
    isLoading,
    profileAdmin: profile?.is_admin,
    userEmail: user?.email
  });

  // Redirect if already authenticated as admin
  if (!isLoading && isAuthenticated && isAdmin) {
    console.log('Redirecting to admin dashboard - user is authenticated admin');
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setShowAccessDenied(false);
    setAttemptedLogin(true);

    console.log('Admin login attempt for:', email);

    try {
      const result = await login(email, password);
      
      if (result.error) {
        console.error('Admin login error:', result.error);
        setError(result.error);
        setIsSubmitting(false);
      } else {
        console.log('Admin login successful, waiting for auth state to update...');
        // Wait a moment for auth state to update, then check admin status
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred during login');
      setIsSubmitting(false);
    }
  };

  // Check if we should show access denied after login attempt
  React.useEffect(() => {
    if (attemptedLogin && !isLoading && isAuthenticated && !isAdmin) {
      setShowAccessDenied(true);
    }
  }, [attemptedLogin, isLoading, isAuthenticated, isAdmin]);

  const handleSwitchAccount = async () => {
    await logout();
    setShowAccessDenied(false);
    setError('');
    setEmail('');
    setPassword('');
    setAttemptedLogin(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {showAccessDenied && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Access denied. Admin privileges required.</p>
                    <p className="text-xs mt-1">
                      Logged in as: {user?.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSwitchAccount}
                    className="text-xs"
                  >
                    Switch Account
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Admin access only. Contact your administrator if you need access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
