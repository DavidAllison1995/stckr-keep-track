
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQrScanner } from '@/hooks/useQrScanner';
import GlobalQRScannerOverlay from '@/components/qr/GlobalQRScannerOverlay';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleScan = (result: string) => {
    console.log('QR Code scanned:', result);
    setScannedCode(result);
    setShowOverlay(true);
  };

  const { videoRef, isScanning, hasPermission, startScanning, stopScanning, retryPermission } = useQrScanner({
    onScan: handleScan,
  });

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setScannedCode(null);
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          <h1 className="text-2xl font-bold">QR Scanner</h1>
        </div>
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
            
            <div className="relative aspect-square max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline 
                muted
              />
              {hasPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Camera access required</p>
                    <Button onClick={retryPermission} size="sm">
                      Enable Camera
                    </Button>
                  </div>
                </div>
              )}
              {hasPermission === true && !isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startScanning}>
                    Start Scanning
                  </Button>
                </div>
              )}
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
                <span>Point your camera at any QR code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">2.</span>
                <span>The app will automatically detect and process the code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">3.</span>
                <span>Choose to assign it to an existing item or create a new one</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Global QR Scanner Overlay */}
      <GlobalQRScannerOverlay
        isOpen={showOverlay}
        onClose={handleCloseOverlay}
        scannedCode={scannedCode}
      />
    </div>
  );
};

export default ScannerPage;
