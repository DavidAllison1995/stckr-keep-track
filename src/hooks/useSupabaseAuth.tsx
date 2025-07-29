
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      // Use Supabase OAuth for both web and native platforms
      // This works with Capacitor 7 using the Browser plugin for OAuth flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: Capacitor.isNativePlatform(),
        },
      });

      if (error) {
        toast({
          title: 'Google Sign-In Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error: error.message };
      }

      if (!Capacitor.isNativePlatform()) {
        toast({
          title: 'Redirecting...',
          description: 'You will be redirected to Google for authentication.',
        });
      }

      return {};
    } catch (error: any) {
      const message = error?.message || 'An unexpected error occurred during Google sign-in';
      toast({
        title: 'Google Sign-In Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const signInWithApple = async () => {
    try {
      // Use native Apple Sign-In on iOS
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        const result = await SignInWithApple.authorize({
          clientId: 'com.stckr.supabase.oauth', // Use the Service ID, not Team ID
          redirectURI: 'https://cudftlquaydissmvqjmv.supabase.co/auth/v1/callback',
          scopes: 'name email'
        });

        if (result.response?.identityToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: result.response.identityToken,
          });

          if (error) {
            console.error('Apple Sign-In error:', error);
            toast({
              title: 'Apple Sign-In Failed',
              description: error.message,
              variant: 'destructive',
            });
            return { error: error.message };
          }

          toast({
            title: 'Welcome!',
            description: 'You have been logged in with Apple.',
          });
          return {};
        } else {
          // Handle case where no identity token is returned
          const errorMsg = 'No identity token received from Apple';
          console.error('Apple Sign-In error:', errorMsg);
          toast({
            title: 'Apple Sign-In Failed',
            description: errorMsg,
            variant: 'destructive',
          });
          return { error: errorMsg };
        }
      } else {
        // Use web OAuth for web platforms and Android
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          console.error('Apple OAuth error:', error);
          toast({
            title: 'Apple Sign-In Failed',
            description: error.message,
            variant: 'destructive',
          });
          return { error: error.message };
        }

        return {};
      }
    } catch (error: any) {
      console.error('Apple Sign-In exception:', error);
      const message = error?.message || 'An unexpected error occurred during Apple sign-in';
      toast({
        title: 'Apple Sign-In Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const logout = async () => {
    try {
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
