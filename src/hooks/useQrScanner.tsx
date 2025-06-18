
import { useRef, useEffect, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';

interface UseQrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

export const useQrScanner = ({ onScan, onError }: UseQrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const enumerateDevices = async () => {
    try {
      console.log('Enumerating media devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available video devices:', videoDevices);
      console.log('Total video devices found:', videoDevices.length);
      return videoDevices;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  };

  const requestCameraStream = async (): Promise<MediaStream | null> => {
    console.log('Requesting camera stream...');
    
    // First try with back camera constraints
    const backCameraConstraints = {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      console.log('Attempting to get back camera with constraints:', backCameraConstraints);
      const stream = await navigator.mediaDevices.getUserMedia(backCameraConstraints);
      console.log('✅ Successfully got back camera stream');
      return stream;
    } catch (backCameraError) {
      console.warn('❌ Back camera failed, trying fallback...', {
        name: backCameraError.name,
        message: backCameraError.message
      });

      // Fallback to any available camera
      try {
        console.log('Attempting fallback with basic video constraints...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Successfully got fallback camera stream');
        return stream;
      } catch (fallbackError) {
        console.error('❌ Fallback camera also failed:', {
          name: fallbackError.name,
          message: fallbackError.message
        });
        throw fallbackError;
      }
    }
  };

  const setupVideoElement = async (stream: MediaStream): Promise<boolean> => {
    if (!videoRef.current) {
      console.error('Video ref not available');
      return false;
    }

    try {
      console.log('Setting up video element...');
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!;
        
        const onLoadedMetadata = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (event: Event) => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error('Video loading failed'));
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
      });

      await videoRef.current.play();
      console.log('✅ Video playing, readyState:', videoRef.current.readyState);
      console.log('Video dimensions:', {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to setup video element:', error);
      return false;
    }
  };

  const cleanupStream = () => {
    console.log('Cleaning up camera stream...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }
  };

  const startScanning = useCallback(async () => {
    console.log('🎥 Starting QR scanner...');
    if (!videoRef.current) {
      console.error('Video ref not available');
      return;
    }
    
    // Cleanup any existing scanner/stream
    if (scannerRef.current) {
      console.log('Stopping existing scanner...');
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    cleanupStream();

    try {
      // Enumerate devices first
      await enumerateDevices();
      
      // Request camera stream
      const stream = await requestCameraStream();
      if (!stream) {
        throw new Error('Failed to get camera stream');
      }
      
      streamRef.current = stream;
      
      // Setup video element
      const videoReady = await setupVideoElement(stream);
      if (!videoReady) {
        throw new Error('Failed to setup video element');
      }

      // Initialize QR scanner
      console.log('Initializing QR scanner...');
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('🎯 QR Scanner detected code:', result.data);
          const now = Date.now();
          // Debounce: only process if different code or 2+ seconds have passed
          if (result.data !== lastScanRef.current || now - lastScanTimeRef.current > 2000) {
            lastScanRef.current = result.data;
            lastScanTimeRef.current = now;
            
            // Haptic feedback on mobile
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }
            
            console.log('✅ Processing QR code:', result.data);
            onScan(result.data);
          } else {
            console.log('⏭️ Ignoring duplicate scan:', result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Back camera on mobile
        }
      );

      scannerRef.current = scanner;
      console.log('▶️ Starting QR scanner engine...');
      await scanner.start();
      console.log('✅ QR scanner started successfully');
      setIsScanning(true);
      setHasPermission(true);
      setRetryCount(0);
    } catch (error: any) {
      console.error('❌ QR Scanner error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Clean up on error
      cleanupStream();
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        console.error('🚫 Camera access denied by user');
        setHasPermission(false);
      } else if (error.name === 'NotReadableError') {
        console.error('📷 Camera is in use by another application');
        setHasPermission(false);
      } else if (error.name === 'NotFoundError') {
        console.error('📷 No camera found on device');
        setHasPermission(false);
      } else {
        // Generic error - might be temporary
        setHasPermission(false);
      }
      
      if (onError) {
        onError(error as Error);
      }
    }
  }, [onScan, onError]);

  const stopScanning = useCallback(() => {
    console.log('⏹️ Stopping QR scanner...');
    if (scannerRef.current) {
      console.log('Stopping and destroying scanner engine...');
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
    cleanupStream();
  }, []);

  const retryPermission = useCallback(async () => {
    console.log('🔄 Retrying camera permission...');
    setHasPermission(null);
    setRetryCount(prev => prev + 1);
    
    // Add small delay before retry
    await new Promise(resolve => setTimeout(resolve, 500));
    startScanning();
  }, [startScanning]);

  useEffect(() => {
    return () => {
      console.log('🧹 useQrScanner cleanup');
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    isScanning,
    hasPermission,
    retryCount,
    startScanning,
    stopScanning,
    retryPermission,
  };
};
