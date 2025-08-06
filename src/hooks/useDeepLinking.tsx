import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up deep link handling on mobile platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleAppUrlOpen = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Parse the deep link URL
      const url = new URL(event.url);
      
      if (url.protocol === 'stckr:') {
        const path = url.pathname;
        console.log('Deep link path:', path);
        
        // Handle OAuth callback
        if (path === '/login-callback' || event.url.includes('login-callback')) {
          console.log('OAuth callback received');
          try {
            // Extract tokens from URL and exchange for session
            const urlParams = new URLSearchParams(url.search);
            const code = urlParams.get('code');
            
            if (code) {
              console.log('Processing OAuth code exchange');
              navigate('/dashboard');
            } else {
              console.log('No OAuth code found in callback');
            }
          } catch (error) {
            console.error('Error processing OAuth callback:', error);
          }
          return;
        }
        
        // Handle different deep link paths
        if (path.startsWith('/items/')) {
          // Navigate to item detail page
          const itemId = path.replace('/items/', '');
          navigate(`/items/${itemId}`);
        } else if (path.startsWith('/item/')) {
          // Handle legacy /item/ format
          const itemId = path.replace('/item/', '');
          navigate(`/items/${itemId}`);
        } else if (path.startsWith('/qr/')) {
          // Navigate to QR resolution page
          const qrCode = path.replace('/qr/', '');
          navigate(`/qr/${qrCode}`);
        } else {
          // Default to dashboard
          navigate('/dashboard');
        }
      }
    };

    // Add the listener
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Check if app was opened with a URL (cold start)
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleAppUrlOpen({ url: result.url });
      }
    });

    // Cleanup
    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};