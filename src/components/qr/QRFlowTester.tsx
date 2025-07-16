import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Monitor, ExternalLink } from 'lucide-react';

const QRFlowTester = () => {
  const [testQRCode, setTestQRCode] = useState('GULMTB');
  const [testItemId, setTestItemId] = useState('d76f926d-aae5-4d9b-887c-c02e731d94e7');

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'desktop';
  };

  const device = detectDevice();

  const testQRScan = (qrCode: string) => {
    const qrUrl = `/qr/${qrCode}`;
    console.log('Testing QR scan flow:', qrUrl);
    window.open(qrUrl, '_blank');
  };

  const testDirectItemLink = (itemId: string) => {
    const itemUrl = `/item/${itemId}`;
    console.log('Testing direct item link:', itemUrl);
    window.open(itemUrl, '_blank');
  };

  const testAppDeepLink = (itemId: string) => {
    const deepLinkUrl = `stckr://item/${itemId}`;
    console.log('Testing app deep link:', deepLinkUrl);
    
    // Try to open the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLinkUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      console.log('Deep link attempt completed');
    }, 1000);
  };

  const testUnassignedQR = () => {
    const unassignedUrl = `/qr/UNASSIGNED123`;
    console.log('Testing unassigned QR flow:', unassignedUrl);
    window.open(unassignedUrl, '_blank');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Flow Tester
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {device === 'desktop' ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            {device}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test assigned QR code */}
        <div className="space-y-3">
          <h3 className="font-semibold">Test Assigned QR Code</h3>
          <div className="flex gap-2">
            <Input
              value={testQRCode}
              onChange={(e) => setTestQRCode(e.target.value)}
              placeholder="Enter QR code"
              className="flex-1"
            />
            <Button onClick={() => testQRScan(testQRCode)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Test QR Scan
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            This should redirect directly to the item card (no holding page)
          </p>
        </div>

        {/* Test direct item link */}
        <div className="space-y-3">
          <h3 className="font-semibold">Test Direct Item Link</h3>
          <div className="flex gap-2">
            <Input
              value={testItemId}
              onChange={(e) => setTestItemId(e.target.value)}
              placeholder="Enter item ID"
              className="flex-1"
            />
            <Button onClick={() => testDirectItemLink(testItemId)} variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Item Link
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Direct link to item card (public access)
          </p>
        </div>

        {/* Test app deep link */}
        {device !== 'desktop' && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test App Deep Link</h3>
            <Button 
              onClick={() => testAppDeepLink(testItemId)}
              className="w-full"
              variant="secondary"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Test stckr://item/{testItemId.slice(0, 8)}...
            </Button>
            <p className="text-sm text-gray-600">
              Attempts to open the STCKR app, falls back to web if not installed
            </p>
          </div>
        )}

        {/* Test unassigned QR */}
        <div className="space-y-3">
          <h3 className="font-semibold">Test Unassigned QR Code</h3>
          <Button onClick={testUnassignedQR} variant="destructive" className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Test Unassigned QR Flow
          </Button>
          <p className="text-sm text-gray-600">
            This should show the QR assignment flow
          </p>
        </div>

        {/* Flow diagram */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">New QR Scan Flow</h3>
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>QR scanned → Resolve to item ID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>If assigned → Smart app redirect to item card</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>If unassigned → Show assignment flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>If not logged in → Auth + redirect</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRFlowTester;