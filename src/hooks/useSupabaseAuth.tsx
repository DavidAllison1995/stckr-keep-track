
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useWebViewAuth } from './useWebViewAuth';


interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthModalVisible: boolean;
  authProvider: 'google' | 'apple';
  handleAuthSuccess: (url: string) => void;
  handleAuthCancel: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const webViewAuth = useWebViewAuth();

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting email/password login for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error: error.message };
      }

      console.log('Login successful');
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
      return {};
    } catch (error: any) {
      console.error('Login exception:', error);
      const message = error?.message || 'An unexpected error occurred during login';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error: error.message };
      }

      toast({
        title: 'Account Created!',
        description: 'Please check your email to confirm your account.',
      });
      return {};
    } catch (error) {
      const message = 'An unexpected error occurred during signup';
      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const signInWithGoogle = webViewAuth.signInWithGoogle;

  const signInWithApple = webViewAuth.signInWithApple;

  const logout = async () => {
    try {
      // Close any open browser sessions on native platform
      if (Capacitor.isNativePlatform()) {
        try {
          await Browser.close();
          console.log('Closed browser sessions');
        } catch (browserError) {
          console.log('Browser close not needed or failed:', browserError);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Logout Failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An unexpected error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    signInWithGoogle,
    signInWithApple,
    logout,
    // Expose WebView auth modal state for components to use
    isAuthModalVisible: webViewAuth.isAuthModalVisible,
    authProvider: webViewAuth.authProvider,
    handleAuthSuccess: webViewAuth.handleAuthSuccess,
    handleAuthCancel: webViewAuth.handleAuthCancel,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
};
