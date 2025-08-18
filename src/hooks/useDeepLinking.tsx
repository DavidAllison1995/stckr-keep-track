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
      
      if (url.protocol === 'com.stckr.keeptrack:' || url.protocol === 'stckr:') {
        const path = url.pathname;
        console.log('Deep link path:', path);
        
        // Handle OAuth callback for WebView flow
        if ((path === '/callback' || path === '/login-callback') || 
            (url.host === 'callback' || event.url.includes('callback'))) {
          console.log('OAuth callback received for WebView flow');
          // This will be handled by AuthModal's URL monitoring
          // No navigation needed as the modal will close and handle success
          return;
        }
        
        // Handle different deep link paths
        if (path.startsWith('/items/') || path.startsWith('/item/')) {
          // Navigate to item detail page (handle both formats)
          const itemId = path.replace(/^\/(items?|item)\//, '');
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