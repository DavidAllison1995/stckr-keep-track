import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { qrService } from '@/services/qrService';

export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAppUrlOpen = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      try {
        const url = new URL(event.url);
        
        // Handle different URL schemes
        if (url.protocol === 'stckr:' || url.hostname === 'stckr.io') {
          const pathSegments = url.pathname.split('/').filter(Boolean);
          
          if (pathSegments.length >= 2) {
            const [type, id] = pathSegments;
            
            switch (type) {
              case 'qr':
                // Log the deep link scan
                await qrService.logQRScan(id, 'mobile', 'deep-link');
                navigate(`/qr/${id}`);
                break;
                
              case 'item':
                navigate(`/items/${id}`);
                break;
                
              default:
                console.log('Unhandled deep link type:', type);
                navigate('/dashboard');
            }
          } else {
            // Fallback to dashboard for malformed links
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        navigate('/dashboard');
      }
    };

    // Listen for incoming deep links
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Check if app was launched with a deep link
    App.getLaunchUrl().then(({ url }) => {
      if (url) {
        handleAppUrlOpen({ url });
      }
    });

    return () => {
      // Cleanup is handled automatically by Capacitor
    };
  }, [navigate]);
};