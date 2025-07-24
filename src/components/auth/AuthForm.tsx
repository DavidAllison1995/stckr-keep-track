
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecureAuthForm from './SecureAuthForm';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';

const AuthForm = () => {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>('login');
  const { trackFailedLogin } = useSecurityMonitoring();
  
  // Initialize security headers
  useSecurityHeaders();

  const handleToggleMode = () => {
    setCurrentMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  const handleAuthError = (email?: string) => {
    trackFailedLogin(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏷️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Stckr</h1>
          <p className="text-blue-100">Track, maintain, and never lose your stuff</p>
        </div>

        <Card className="backdrop-blur-lg bg-white/90 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value={currentMode}>
                <SecureAuthForm 
                  mode={currentMode} 
                  onToggleMode={handleToggleMode}
                  onAuthError={handleAuthError}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
