import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Loader2 } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import jsQR from 'jsqr';
import { checkAndRequestCameraPermissions } from '@/utils/cameraPermissions';

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

  // Convert URI to ImageData to avoid base64 memory spikes
  const uriToImageData = (uri: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
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
      img.src = uri;
    });
  };

  const scanWithCapacitorCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('QR Scanner: Starting scan process...');
      console.log('QR Scanner: Platform check:', {
        isNative: Capacitor.isNativePlatform(),
        platform: Capacitor.getPlatform()
      });

      // Check if Camera plugin is available first
      if (!CapacitorCamera) {
        console.error('QR Scanner: Capacitor Camera plugin not available');
        setError('Camera plugin not available. Please ensure the app is running on a mobile device.');
        setIsLoading(false);
        return;
      }

      // Check camera permissions via unified helper
      console.log('QR Scanner: Checking camera permissions...');
      const permission = await checkAndRequestCameraPermissions();
      if (!permission.granted) {
        console.error('QR Scanner: Camera permission not granted:', permission.message);
        setError(permission.message || 'Camera permission is required to scan QR codes. Please enable camera access in Settings.');
        setIsLoading(false);
        return;
      }

      console.log('QR Scanner: Launching camera...');
      // Use Capacitor Camera API for mobile devices with proper error handling and timeout
      const image = await Promise.race([
        CapacitorCamera.getPhoto({
          quality: 90, // Higher quality for better QR detection
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          presentationStyle: 'fullscreen',
          saveToGallery: false,
          // Force camera mode
          promptLabelHeader: 'Scan QR Code',
          promptLabelCancel: 'Cancel',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Camera timeout - please try again')), 30000)
        )
      ]) as any;

      console.log('QR Scanner: Photo captured:', {
        hasPath: !!image.webPath,
        format: image.format
      });

      if (image.webPath) {
        console.log('QR Scanner: Processing image for QR codes...');
        // Convert URI to ImageData and scan for QR code
        const imageData = await uriToImageData(image.webPath);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert', // Performance optimization
        });

        if (qrCode) {
          console.log('QR Scanner: QR Code detected:', qrCode.data);
          setScanComplete(true);
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          setTimeout(() => onScan(qrCode.data), 500);
          return;
        } else {
          console.log('QR Scanner: No QR code found in image');
          setError('No QR code found in the image. Please ensure the QR code is clearly visible and try again.');
          setIsLoading(false);
          return;
        }
      } else {
        throw new Error('No image path received from camera');
      }
    } catch (error: any) {
      console.error('QR Scanner: Capacitor camera error:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorMessage.includes('user cancelled')) {
          console.log('QR Scanner: User cancelled');
          onClose();
          return;
        }
        
        if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('not authorized')) {
          setError('Camera permission denied. Please enable camera access in Settings > Privacy > Camera and try again.');
          return;
        }
        
        if (errorMessage.includes('unavailable') || errorMessage.includes('not available') || errorMessage.includes('not supported')) {
          setError('Camera is not available on this device or is currently in use by another app.');
          return;
        }

        if (errorMessage.includes('busy') || errorMessage.includes('in use')) {
          setError('Camera is currently busy. Please close other apps using the camera and try again.');
          return;
        }

        if (errorMessage.includes('timeout')) {
          setError('Camera failed to start. Please try again.');
          return;
        }
      }
      
      setError('Failed to access camera. Please check that camera permissions are enabled and try again.');
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