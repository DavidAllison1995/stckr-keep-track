import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
// On native, use an in-app browser via AuthModal; on web, use Supabase OAuth

export const useWebViewAuth = () => {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'apple'>('google');
  const { toast } = useToast();

  const handleAuthSuccess = useCallback(async (url: string) => {
    try {
      setIsAuthModalVisible(false);
      
      console.log('Processing auth callback URL:', url);
      
      // Try different parsing methods for the URL
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      
      if (url.includes('#')) {
        // Parse hash fragment
        const urlObj = new URL(url);
        accessToken = urlObj.hash.match(/access_token=([^&]*)/)?.[1];
        refreshToken = urlObj.hash.match(/refresh_token=([^&]*)/)?.[1];
      } else if (url.includes('code=')) {
        // Handle authorization code flow
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        if (code) {
          console.log('Authorization code received, exchanging for tokens...');
          // Let Supabase handle the code exchange
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
          if (data?.session) {
            toast({
              title: 'Welcome!',
              description: `You have been signed in with ${authProvider === 'google' ? 'Google' : 'Apple'} successfully.`,
            });
            return;
          }
        }
      }
      
      if (accessToken) {
        // Set the session using the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: decodeURIComponent(accessToken),
          refresh_token: refreshToken ? decodeURIComponent(refreshToken) : '',
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Welcome!',
          description: `You have been signed in with ${authProvider === 'google' ? 'Google' : 'Apple'} successfully.`,
        });
      } else {
        throw new Error('No access token or authorization code found in callback URL');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast({
        title: 'Authentication Failed',
        description: error?.message || 'Failed to complete authentication',
        variant: 'destructive',
      });
    }
  }, [authProvider, toast]);

  const handleAuthCancel = useCallback(() => {
    setIsAuthModalVisible(false);
    toast({
      title: 'Authentication Cancelled',
      description: 'Sign-in was cancelled',
      variant: 'destructive',
    });
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // Use in-app browser flow via AuthModal on native
        setAuthProvider('google');
        setIsAuthModalVisible(true);
        return {};
      }

      const redirectTo = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      return {};
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      const message = error?.message || 'An unexpected error occurred during Google sign-in';
      toast({
        title: 'Google Sign-In Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  }, [toast]);

  const signInWithApple = useCallback(async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // Use in-app browser flow via AuthModal on native
        setAuthProvider('apple');
        setIsAuthModalVisible(true);
        return {};
      }

      const redirectTo = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo },
      });
      if (error) throw error;
      return {};
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      const message = error?.message || 'An unexpected error occurred during Apple sign-in';
      toast({
        title: 'Apple Sign-In Failed',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  }, [toast]);

  return {
    isAuthModalVisible,
    authProvider,
    handleAuthSuccess,
    handleAuthCancel,
    signInWithGoogle,
    signInWithApple,
  };
};