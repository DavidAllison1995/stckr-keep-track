import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export const useWebViewAuth = () => {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'apple'>('google');
  const { toast } = useToast();

  const handleAuthSuccess = useCallback(async (url: string) => {
    try {
      setIsAuthModalVisible(false);
      
      // Parse the URL to extract tokens
      const urlObj = new URL(url);
      const accessToken = urlObj.hash.match(/access_token=([^&]*)/)?.[1];
      const refreshToken = urlObj.hash.match(/refresh_token=([^&]*)/)?.[1];
      const expiresIn = urlObj.hash.match(/expires_in=([^&]*)/)?.[1];
      
      if (accessToken) {
        // Set the session using the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Welcome!',
          description: `You have been signed in with ${authProvider === 'google' ? 'Google' : 'Apple'} successfully.`,
        });
      } else {
        throw new Error('No access token found in callback URL');
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
      if (!Capacitor.isNativePlatform()) {
        // For web, use standard OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
        return {};
      }
      
      // For native, use WebView modal
      setAuthProvider('google');
      setIsAuthModalVisible(true);
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
      if (!Capacitor.isNativePlatform()) {
        // For web, use standard OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
        return {};
      }
      
      // For native, use WebView modal
      setAuthProvider('apple');
      setIsAuthModalVisible(true);
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