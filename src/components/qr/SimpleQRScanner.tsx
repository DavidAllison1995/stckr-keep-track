
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import CapacitorQRScanner from './CapacitorQRScanner';

interface SimpleQRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const SimpleQRScanner = ({ onScan, onClose }: SimpleQRScannerProps) => {
  // Use Capacitor camera for mobile devices to avoid iPad WebView crashes
  if (Capacitor.isNativePlatform()) {
    return <CapacitorQRScanner onScan={onScan} onClose={onClose} />;
  }

  // Web-based scanner for desktop/development
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [scanComplete, setScanComplete] = useState(false);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsScanning(false);
    setIsLoading(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || scanComplete) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data and scan for QR code
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      console.log('QR Code detected:', code.data);
      setScanComplete(true);
      stopCamera();
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
      // Call the onScan callback
      setTimeout(() => onScan(code.data), 500);
      return;
    }

    // Continue scanning
    animationRef.current = requestAnimationFrame(scanFrame);
  }, [onScan, stopCamera, scanComplete]);

  const startCamera = useCallback(async () => {
    console.log('Starting camera...');
    setIsLoading(true);
    setError('');
    setScanComplete(false);

    try {
      // First try back camera
      console.log('Requesting back camera...');
      let stream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        console.log('✅ Back camera acquired');
      } catch (backCameraError) {
        console.warn('Back camera failed, trying front camera...', backCameraError);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Front camera acquired');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Video playing, readyState:', videoRef.current.readyState);
        
        setIsLoading(false);
        setIsScanning(true);
        
        // Start scanning after a short delay
        setTimeout(() => {
          scanFrame();
        }, 100);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setIsLoading(false);
      
      if (error.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access and try again.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        setError('Camera is in use by another application. Please close other apps and try again.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, [scanFrame]);

  const handleStartScan = () => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleRetry = () => {
    setError('');
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartScan}
          className="text-white hover:bg-white/20"
          disabled={isLoading}
        >
          {isScanning ? 'Stop' : 'Start'}
        </Button>
      </div>

      {/* Video Preview */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        muted
        style={{ display: isScanning ? 'block' : 'none' }}
      />

      {/* Hidden canvas for QR detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Overlay dimming */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Scan Frame */}
      {isScanning && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning Frame */}
            <div className="w-72 h-72 border-2 border-white rounded-2xl relative bg-white/5">
              {/* Corner Indicators */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-2xl"></div>
            </div>
            
            {/* Instructions */}
            <div className="mt-8 text-center">
              <p className="text-white/90 text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                Point your camera at a QR code to scan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mx-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-700">Starting camera...</p>
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
            <Button onClick={handleRetry} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Camera
            </Button>
          </div>
        </div>
      )}

      {/* Start Button (when not scanning) */}
      {!isScanning && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Button
              onClick={handleStartScan}
              size="lg"
              className="bg-primary text-white px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <Camera className="w-6 h-6 mr-2" />
              Start Scan
            </Button>
            <p className="text-white/70 mt-4 text-sm">
              Tap to activate your camera and scan QR codes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleQRScanner;
