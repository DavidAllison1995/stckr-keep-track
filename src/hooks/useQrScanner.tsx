
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
    if (!videoRef.current || scannerRef.current) return;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const now = Date.now();
          // Debounce: only process if different code or 2+ seconds have passed
          if (result.data !== lastScanRef.current || now - lastScanTimeRef.current > 2000) {
            lastScanRef.current = result.data;
            lastScanTimeRef.current = now;
            
            // Haptic feedback on mobile
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }
            
            onScan(result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Back camera on mobile
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
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
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  const retryPermission = useCallback(() => {
    setHasPermission(null);
    startScanning();
  }, [startScanning]);

  useEffect(() => {
    return () => {
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
