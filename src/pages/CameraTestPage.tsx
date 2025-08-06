import CameraDebugger from '@/components/camera/CameraDebugger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ImageUpload from '@/components/forms/ImageUpload';
import SimpleQRScanner from '@/components/qr/SimpleQRScanner';

const CameraTestPage = () => {
  const navigate = useNavigate();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleQRScan = (code: string) => {
    setScannedCode(code);
    setShowQRScanner(false);
  };

  const handleCloseScanner = () => {
    setShowQRScanner(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="p-2 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Camera Tests</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Diagnostics */}
        <CameraDebugger />

        {/* Manual Tests */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Manual Camera Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload Test */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Photo Upload Test</h3>
              <p className="text-gray-400 text-sm">Test the "Take Photo" functionality in item creation</p>
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageChange={setImageUrl}
                userId="test-user"
                itemId="test-item"
              />
              {imageUrl && (
                <div className="text-green-400 text-sm">✅ Photo uploaded successfully!</div>
              )}
            </div>

            {/* QR Scanner Test */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">QR Scanner Test</h3>
              <p className="text-gray-400 text-sm">Test the QR code scanning functionality</p>
              <Button 
                onClick={() => setShowQRScanner(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Test QR Scanner
              </Button>
              {scannedCode && (
                <div className="bg-green-900 border border-green-600 rounded-lg p-3">
                  <div className="text-green-400 text-sm font-medium">✅ QR Code Scanned:</div>
                  <div className="text-white text-sm font-mono mt-1">{scannedCode}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-300 space-y-2">
              <p><strong>1. Run Diagnostics:</strong> Click "Run Camera Diagnostics" to check permissions and plugin availability.</p>
              <p><strong>2. Test Photo Upload:</strong> Use the "Take Photo" button to test camera access for item photos.</p>
              <p><strong>3. Test QR Scanner:</strong> Use the "Test QR Scanner" button to test camera access for QR scanning.</p>
              <p><strong>4. Check Console:</strong> Open developer tools to see detailed error logs.</p>
            </div>
            
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-2">Common Issues & Solutions:</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
              <li>• <strong>Permission Denied:</strong> Enable camera access in device Settings → Privacy → Camera</li>
              <li>• <strong>Camera Busy:</strong> Close other apps using the camera</li>
              <li>• <strong>Not Available:</strong> Test on a physical device with a camera</li>
              <li>• <strong>Plugin Missing:</strong> Run `npx cap sync` to update native modules</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Overlay */}
      {showQRScanner && (
        <SimpleQRScanner 
          onScan={handleQRScan}
          onClose={handleCloseScanner}
        />
      )}
    </div>
  );
};

export default CameraTestPage;