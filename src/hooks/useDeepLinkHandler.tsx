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
        const pathSegments = url.pathname.split('/').filter(Boolean);

        if (url.protocol.startsWith('stckr') || url.hostname === 'stckr.io') {
          if (pathSegments.length >= 2) {
            const [type, id] = pathSegments;

            if (type === 'qr') {
              await qrService.logQRScan(id, 'mobile', 'deep-link');
              navigate(`/qr/${id}`);
              return;
            }

            if (type === 'item') {
              navigate(`/items/${id}`);
              return;
            }
          }
        }

        navigate('/dashboard'); // fallback
      } catch (e) {
        console.error('Error handling deep link:', e);
        navigate('/dashboard');
      }
    };

    App.addListener('appUrlOpen', handleAppUrlOpen);
    App.getLaunchUrl().then(({ url }) => {
      if (url) handleAppUrlOpen({ url });
    });
  }, [navigate]);
};