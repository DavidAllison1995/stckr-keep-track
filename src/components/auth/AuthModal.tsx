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

  const supabaseUrl = 'https://cudftlquaydissmvqjmv.supabase.co';
  const redirectUrl = Capacitor.isNativePlatform() 
    ? 'com.stckr.keeptrack://callback'
    : `${window.location.origin}/`;

  const handleStartAuth = async () => {
    setLoading(true);
    
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
    
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({
          url: authUrl,
          windowName: '_self'
        });
        
        // Listen for app URL open events
        const { App } = await import('@capacitor/app');
        App.addListener('appUrlOpen', (event) => {
          if (event.url.startsWith('com.stckr.keeptrack://callback')) {
            Browser.close();
            onSuccess(event.url);
            App.removeAllListeners();
          }
        });
      } catch (error) {
        console.error('Failed to open browser:', error);
        setLoading(false);
      }
    } else {
      // Web fallback - use iframe
      setWebViewUrl(authUrl);
    }
  };

  const handleWebMessage = (event: MessageEvent) => {
    if (event.origin === supabaseUrl) {
      const url = event.data.url || window.location.href;
      if (url.includes('access_token') || url.includes('code')) {
        onSuccess(url);
      }
    }
  };

  React.useEffect(() => {
    if (visible && !Capacitor.isNativePlatform()) {
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      handleStartAuth();
    }
    return () => {
      setLoading(false);
      setWebViewUrl('');
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
          {loading && Capacitor.isNativePlatform() ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Opening {provider === 'google' ? 'Google' : 'Apple'} sign in...
              </p>
            </div>
          ) : !Capacitor.isNativePlatform() && webViewUrl ? (
            <div className="w-full h-96 border rounded-lg overflow-hidden">
              <iframe
                src={webViewUrl}
                className="w-full h-full"
                title={`${provider} OAuth`}
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Preparing authentication...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};