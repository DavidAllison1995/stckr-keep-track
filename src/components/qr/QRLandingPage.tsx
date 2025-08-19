import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Download, ExternalLink } from 'lucide-react';

interface QRLandingPageProps {
  qrKey: string;
}

export const QRLandingPage = ({ qrKey }: QRLandingPageProps) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  const handleOpenInApp = () => {
    // Try to open the app with deep link
    const appUrl = `stckr://qr/${qrKey}`;
    const universalLink = `https://stckr.io/qr/${qrKey}`;
    
    if (platform === 'ios') {
      // For iOS, try universal link first
      window.location.href = universalLink;
    } else if (platform === 'android') {
      // For Android, try intent first, fallback to universal link
      const intent = `intent://qr/${qrKey}#Intent;scheme=stckr;package=com.stckr.keeptrack;S.browser_fallback_url=${encodeURIComponent(universalLink)};end`;
      window.location.href = intent;
    } else {
      // Desktop - redirect to web app
      window.location.href = universalLink;
    }
  };

  const handleDownloadApp = () => {
    if (platform === 'ios') {
      // TODO: Replace with actual App Store URL when available
      window.open('https://apps.apple.com/app/stckr', '_blank');
    } else if (platform === 'android') {
      // TODO: Replace with actual Play Store URL when available  
      window.open('https://play.google.com/store/apps/details?id=com.stckr.keeptrack', '_blank');
    }
  };

  const handleContinueOnWeb = () => {
    // Navigate to web version
    window.location.href = `/qr/${qrKey}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            STCKR QR Code
          </CardTitle>
          <p className="text-gray-600">
            Code: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{qrKey}</span>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Track and manage your belongings with STCKR
            </p>
          </div>

          {platform !== 'desktop' && (
            <>
              <Button 
                onClick={handleOpenInApp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Open in STCKR App
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Don't have the app yet?</p>
                <Button 
                  onClick={handleDownloadApp}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Get STCKR for {platform === 'ios' ? 'iOS' : 'Android'}
                </Button>
              </div>
            </>
          )}

          <div className="border-t border-gray-200 pt-4">
            <Button 
              onClick={handleContinueOnWeb}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Continue on Web
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              STCKR helps you track warranties, maintenance schedules, and important documents for all your belongings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};