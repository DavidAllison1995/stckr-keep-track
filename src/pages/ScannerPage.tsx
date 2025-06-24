import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRScannerOverlay from '@/components/qr/QRScannerOverlay';
const ScannerPage = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const handleScan = (result: string) => {
    console.log('QR Code scanned:', result);
    setScannedCode(result);
    setShowScanner(false);
  };
  const handleStartScan = () => {
    setShowScanner(true);
    setScannedCode(null);
  };
  const handleCloseScanner = () => {
    setShowScanner(false);
    setScannedCode(null);
  };
  return <div className="p-4 pb-20 space-y-6">
      {/* Header with Buy Stickers Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            <h1 className="text-2xl font-bold">QR Scanner</h1>
          </div>
        </div>
        
        <Button onClick={() => navigate('/shop')} variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Stickers
        </Button>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Point your camera at a QR code to scan it. This will help you assign QR codes to your items.
            </p>
            
            <div className="text-center">
              <Button onClick={handleStartScan} size="lg" className="px-8">
                <QrCode className="w-5 h-5 mr-2" />
                Start Scanner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">How to use:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex gap-2">
                <span className="text-blue-600">1.</span>
                <span>Click "Start Scanner" to open the camera</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">2.</span>
                <span>Point your camera at your STCKR QR code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">3.</span>
                <span>The app will automatically detect and process the code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">4.</span>
                <span>Choose to assign it to an existing item or create a new one</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Overlay */}
      <QRScannerOverlay isOpen={showScanner} onClose={handleCloseScanner} scannedCode={scannedCode} />
    </div>;
};
export default ScannerPage;