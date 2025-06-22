
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
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
        setIsLoading(false);
        return { error: error.message };
      }

      console.log('Login successful:', data.user?.email);
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
      
      return {};
    } catch (error) {
      const message = 'An unexpected error occurred during login';
      console.error('Unexpected login error:', error);
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return { error: message };
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Signup attempt for:', email);
      setIsLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
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
        console.error('Signup error:', error);
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return { error: error.message };
      }

      console.log('Signup successful:', data.user?.email);
      toast({
        title: 'Account Created!',
        description: 'Please check your email to confirm your account.',
      });
      
      return {};
    } catch (error) {
      const message = 'An unexpected error occurred during signup';
      console.error('Unexpected signup error:', error);
      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return { error: message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logout attempt');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Logout Failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Logout successful');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('Unexpected logout error:', error);
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
    logout,
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
