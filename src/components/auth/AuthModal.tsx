import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface AuthModalProps {
  provider: 'google' | 'apple';
  visible: boolean;
  onSuccess: (url: string) => void;
  onCancel: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  provider, 
  visible, 
  onSuccess, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const listenerRef = React.useRef<{ remove: () => void } | null>(null);

  const supabaseUrl = 'https://cudftlquaydissmvqjmv.supabase.co';
  const redirectUrl = Capacitor.isNativePlatform() 
    ? 'capacitor://localhost/callback'
    : `${window.location.origin}/auth`;

  const handleStartAuth = async () => {
    setLoading(true);
    
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}&flow_type=pkce`;
    console.log('Starting OAuth flow with URL:', authUrl);
    
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Opening OAuth in native browser...');
        
        // Set up app URL listener first
        const { App } = await import('@capacitor/app');
        
        const handleAppUrl = (event: { url: string }) => {
          console.log('Deep link received:', event.url);
          if (event.url.startsWith('capacitor://') || event.url.startsWith('com.stckr.keeptrack://')) {
            console.log('OAuth callback detected, closing browser and processing...');
            Browser.close().catch(console.error);
            onSuccess(event.url);
            listenerRef.current?.remove?.();
          }
        };
        
        listenerRef.current = await App.addListener('appUrlOpen', handleAppUrl as any);
        
        await Browser.open({
          url: authUrl,
          windowName: '_self',
          toolbarColor: '#ffffff',
          presentationStyle: 'popover'
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to open browser:', error);
        setLoading(false);
        onCancel();
      }
    } else {
      // Web fallback - standard OAuth redirect
      console.log('Web platform detected, using standard redirect...');
      window.location.href = authUrl;
    }
  };

  React.useEffect(() => {
    if (visible) {
      handleStartAuth();
    }
    return () => {
      setLoading(false);
      setWebViewUrl('');
      listenerRef.current?.remove?.();
    };
  }, [visible, provider]);

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Sign in with {provider === 'google' ? 'Google' : 'Apple'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground text-center">
              {Capacitor.isNativePlatform() 
                ? `Opening ${provider === 'google' ? 'Google' : 'Apple'} sign in...`
                : 'Redirecting to authentication...'
              }
            </p>
            {Capacitor.isNativePlatform() && (
              <p className="text-xs text-muted-foreground text-center">
                Complete the sign-in process in the browser that opens, then return to this app.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};