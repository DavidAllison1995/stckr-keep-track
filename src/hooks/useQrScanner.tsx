
import { useRef, useEffect, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';

interface UseQrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

export const useQrScanner = ({ onScan, onError }: UseQrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const startScanning = useCallback(async () => {
    console.log('startScanning called');
    if (!videoRef.current) {
      console.error('Video ref not available');
      return;
    }
    
    if (scannerRef.current) {
      console.log('Scanner already exists, stopping first');
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }

    try {
      console.log('Requesting camera access...');
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Scanner detected code:', result.data);
          const now = Date.now();
          // Debounce: only process if different code or 2+ seconds have passed
          if (result.data !== lastScanRef.current || now - lastScanTimeRef.current > 2000) {
            lastScanRef.current = result.data;
            lastScanTimeRef.current = now;
            
            // Haptic feedback on mobile
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }
            
            console.log('Processing QR code:', result.data);
            onScan(result.data);
          } else {
            console.log('Ignoring duplicate scan:', result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Back camera on mobile
        }
      );

      scannerRef.current = scanner;
      console.log('Starting QR scanner...');
      await scanner.start();
      console.log('QR scanner started successfully');
      setIsScanning(true);
      setHasPermission(true);
    } catch (error) {
      console.error('QR Scanner error:', error);
      setHasPermission(false);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [onScan, onError]);

  const stopScanning = useCallback(() => {
    console.log('stopScanning called');
    if (scannerRef.current) {
      console.log('Stopping and destroying scanner');
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  const retryPermission = useCallback(() => {
    console.log('retryPermission called');
    setHasPermission(null);
    startScanning();
  }, [startScanning]);

  useEffect(() => {
    return () => {
      console.log('useQrScanner cleanup');
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
    retryPermission,
  };
};
