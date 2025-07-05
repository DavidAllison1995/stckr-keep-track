import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Mail, Lock, User, QrCode, Eye, EyeOff, Info } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    login,
    signup,
    signInWithGoogle,
    signInWithApple
  } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('stckr_remember_user', email);
    } else {
      localStorage.removeItem('stckr_remember_user');
    }
    
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    await signup(email, password, firstName, lastName);
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  };

  const handleAppleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithApple();
    setIsSubmitting(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle QR patterns and household item icons */}
          <div className="absolute top-20 left-20 opacity-5">
            <QrCode className="w-32 h-32 text-purple-600" />
          </div>
          <div className="absolute bottom-32 right-32 opacity-5">
            <QrCode className="w-24 h-24 text-blue-600" />
          </div>
          <div className="absolute top-1/3 right-20 opacity-5">
            <span className="text-6xl">🔧</span>
          </div>
          <div className="absolute bottom-1/4 left-32 opacity-5">
            <span className="text-5xl">🚗</span>
          </div>
          <div className="absolute top-1/2 left-16 opacity-5">
            <span className="text-4xl">📄</span>
          </div>
          <div className="absolute top-20 right-1/4 opacity-5">
            <span className="text-5xl">🔌</span>
          </div>
        </div>

        {/* Centered Content */}
        <div className="w-full max-w-md">
          {/* Logo and Branding - Centered */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <img 
                src="/lovable-uploads/b040bcf1-975f-4316-8744-a19b2453d26e.png" 
                alt="STCKR Logo" 
                className="h-10 mx-auto cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => navigate('/')}
              />
            </div>
            <p className="text-gray-600 text-sm font-medium">Track. Organise. Simplify.</p>
          </div>

          {/* Main Form Card with enhanced styling */}
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden">
            {/* Brand watermark effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <QrCode className="w-full h-full text-purple-600" />
            </div>
            
            <CardHeader className="text-center pb-4 relative">
              <CardTitle className="text-xl font-bold text-gray-900">Get Started</CardTitle>
            </CardHeader>
            <CardContent className="relative px-6 pb-6">
              {/* Social Login Buttons - Fixed styling */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  variant="outline" 
                  className="w-full h-10 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  onClick={handleAppleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>  
                  Apple
                </Button>
              </div>

              {/* Demo Login for Reviewers */}
              <Button 
                variant="outline" 
                className="w-full h-10 mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 font-medium shadow-sm"
                onClick={async () => {
                  setIsSubmitting(true);
                  const result = await login('demo@stckr.app', 'demo123');
                  if (result.error && result.error.includes('Invalid login credentials')) {
                    // If demo user doesn't exist, try to sign up
                    await signup('demo@stckr.app', 'demo123', 'Demo', 'User');
                  }
                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
              >
                🎯 Demo Login (For Reviewers)
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <Tabs defaultValue="signup" className="w-full">
                {/* Enhanced Tab Pills */}
                <div className="bg-gray-50 p-1 rounded-xl mb-6 shadow-inner">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto">
                    <TabsTrigger 
                      value="signup" 
                      className="rounded-lg py-2 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 transition-all data-[state=active]:border data-[state=active]:border-purple-100"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger 
                      value="login" 
                      className="rounded-lg py-2 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 transition-all data-[state=active]:border data-[state=active]:border-purple-100"
                    >
                      Log In
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="firstName" 
                            name="firstName" 
                            placeholder="First name" 
                            className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="lastName" 
                            name="lastName" 
                            placeholder="Last name" 
                            className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="signup-email" 
                          name="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="signup-password" 
                          name="password" 
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Create a password" 
                          className="pl-10 pr-12 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                          required 
                          minLength={6} 
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showSignupPassword ? "Hide password" : "Show password"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating account...' : 'Start for Free'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="login-email" 
                          name="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                          required 
                          defaultValue={localStorage.getItem('stckr_remember_user') || ''}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="login-password" 
                          name="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password" 
                          className="pl-10 pr-12 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all shadow-sm" 
                          required 
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showPassword ? "Hide password" : "Show password"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    
                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="rounded-sm"
                      />
                      <div className="flex items-center space-x-1">
                        <Label 
                          htmlFor="remember-me" 
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Remember me on this device
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Saves your login on this browser for faster access</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Log In'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Trust indicators - Repositioned below the forms */}
              <div className="text-center text-sm text-gray-500 space-y-1 mt-6 pt-4 border-t border-gray-100">
                <p>✓ Available on mobile and desktop</p>
                <p>✓ Free to start, no credit card required</p>
                <p>✓ Built for busy households and smart storage</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AuthPage;
