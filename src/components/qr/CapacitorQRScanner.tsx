import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Loader2 } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import jsQR from 'jsqr';

interface CapacitorQRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const CapacitorQRScanner = ({ onScan, onClose }: CapacitorQRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [scanComplete, setScanComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Convert base64 image to ImageData for QR scanning
  const base64ToImageData = (base64: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = `data:image/jpeg;base64,${base64}`;
    });
  };

  const scanWithCapacitorCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Check camera permissions first (critical for iPad stability)
      try {
        const permissionStatus = await CapacitorCamera.checkPermissions();
        
        if (permissionStatus.camera === 'denied') {
          const requestResult = await CapacitorCamera.requestPermissions();
          if (requestResult.camera !== 'granted') {
            setError('Camera permission is required to scan QR codes. Please allow camera access in Settings.');
            return;
          }
        }
      } catch (permError) {
        console.warn('Permission check failed:', permError);
        // Continue anyway for older iOS versions
      }

      // Use Capacitor Camera API for mobile devices with iPad-safe options
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        // iPad-specific: Use fullscreen for better compatibility
        presentationStyle: 'fullscreen',
        saveToGallery: false,
      });

      if (image.base64String) {
        // Convert base64 to ImageData and scan for QR code
        const imageData = await base64ToImageData(image.base64String);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode) {
          console.log('QR Code detected:', qrCode.data);
          setScanComplete(true);
          
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          
          // Call the onScan callback
          setTimeout(() => onScan(qrCode.data), 500);
          return;
        } else {
          // No QR code found, allow retry
          setError('No QR code found in the image. Please try again.');
          setIsLoading(false);
          return;
        }
      }
    } catch (error: any) {
      console.error('Capacitor camera error:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
          // User cancelled, just close
          onClose();
          return;
        }
        
        if (errorMessage.includes('permission')) {
          setError('Camera permission is required to scan QR codes. Please allow camera access in your device settings.');
          return;
        }
        
        if (errorMessage.includes('not available')) {
          setError('Camera is not available on this device.');
          return;
        }
      }
      
      setError('Failed to access camera. Please try again.');
    }
  }, [onScan, onClose]);

  const handleStartScan = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Camera API for mobile devices
      await scanWithCapacitorCamera();
    } else {
      // For web, we'll fall back to the existing SimpleQRScanner
      setError('This feature requires a mobile device. Please use the web QR scanner instead.');
    }
  }, [scanWithCapacitorCamera]);

  const handleRetry = () => {
    setError('');
    setRetryCount(prev => prev + 1);
    handleStartScan();
  };

  const handleClose = () => {
    setIsScanning(false);
    setIsLoading(false);
    setError('');
    setScanComplete(false);
    onClose();
  };

  // Auto-start scanning when component mounts (for mobile)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      handleStartScan();
    }
  }, [handleStartScan]);

  if (scanComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded"></div>
          </div>
          <h3 className="text-lg font-semibold text-green-700">Scan Complete!</h3>
          <p className="text-gray-600 mt-2">Processing QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <h2 className="text-white font-semibold text-lg">QR Scanner</h2>
        
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mx-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-700">Opening camera...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mx-6 text-center max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Camera Error</h3>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Start Button (when not scanning and no error) */}
      {!isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Button
              onClick={handleStartScan}
              size="lg"
              className="bg-primary text-white px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <Camera className="w-6 h-6 mr-2" />
              Scan QR Code
            </Button>
            <p className="text-white/70 mt-4 text-sm">
              Tap to take a photo and scan for QR codes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacitorQRScanner;