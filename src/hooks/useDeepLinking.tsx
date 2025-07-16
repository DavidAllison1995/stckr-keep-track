import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

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