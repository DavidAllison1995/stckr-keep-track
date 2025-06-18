
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQrScanner } from '@/hooks/useQrScanner';
import { qrService } from '@/services/qr';
import { useToast } from '@/hooks/use-toast';
import QRAssignmentModal from './QRAssignmentModal';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';

const QRScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQrCode, setCurrentQrCode] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleScan = async (code: string) => {
    console.log('QR Code scanned:', code);
    if (isProcessing) {
      console.log('Already processing, ignoring scan');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('Checking QR code status...');
      const status = await qrService.getStatus(code);
      console.log('QR status:', status);
      
      if (status.isAssigned && status.itemId) {
        // Navigate to assigned item
        console.log('Navigating to item:', status.itemId);
        toast({
          title: 'QR Code Found',
          description: `Opening ${status.itemName}...`,
        });
        navigate(`/items/${status.itemId}?tab=maintenance`);
      } else {
        // Show assignment modal
        console.log('Showing assignment modal for unassigned QR code');
        setCurrentQrCode(code);
        setShowAssignmentModal(true);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError('Unable to recognize or assign this QR code. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    videoRef,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
    retryPermission,
  } = useQrScanner({
    onScan: handleScan,
    onError: (error) => {
      console.error('Scanner error:', error);
      setError('Camera error occurred. Please try again.');
    },
  });

  const handleStartScan = () => {
    console.log('Start scan button clicked');
    setError('');
    startScanning();
  };

  const handleStopScan = () => {
    console.log('Stop scan button clicked');
    stopScanning();
  };

  const handleCloseAssignment = () => {
    setShowAssignmentModal(false);
    setCurrentQrCode('');
    // Resume scanning after modal closes
    if (hasPermission) {
      startScanning();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">Scan QR codes to quickly access your items</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {!isScanning && hasPermission !== false ? (
            <div className="text-center py-12 px-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-600 mb-6">
                Tap the button below to start scanning QR codes
              </p>
              <Button 
                onClick={handleStartScan}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isProcessing}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Start Scanning'}
              </Button>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-12 px-6">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Camera Access Needed
              </h3>
              <p className="text-gray-600 mb-6">
                Allow camera access to scan QR codes.
              </p>
              <Button onClick={retryPermission} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 sm:h-80 object-cover"
                playsInline
                muted
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button onClick={handleStopScan} variant="secondary">
                  Stop Scanning
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Scan any QR code sticker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Assign it to one of your items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Quick access to item details anytime</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <QRAssignmentModal
        isOpen={showAssignmentModal}
        onClose={handleCloseAssignment}
        qrCode={currentQrCode}
      />
    </div>
  );
};

export default QRScanner;
