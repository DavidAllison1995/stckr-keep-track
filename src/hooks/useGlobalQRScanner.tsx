
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useGlobalQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeScans, setActiveScans] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGlobalScan = () => {
    if (activeScans > 0) {
      console.log('Scan already in progress, ignoring request');
      return;
    }
    setIsScanning(true);
    setActiveScans(1);
  };

  const stopGlobalScan = () => {
    setIsScanning(false);
    setActiveScans(0);
  };

  const handleScanResult = (result: string) => {
    console.log('Global QR scan result:', result);
    
    // Handle the scanned QR code
    toast({
      title: "QR Code Scanned",
      description: `Scanned: ${result}`,
    });
    
    // Navigate to QR claim page or handle appropriately
    navigate(`/qr-claim?code=${encodeURIComponent(result)}`);
    
    stopGlobalScan();
  };

  // Handle app state changes to cleanup scanning
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAppStateChange = (state: { isActive: boolean }) => {
      if (!state.isActive && isScanning) {
        console.log('App went background, stopping scan');
        stopGlobalScan();
      }
    };

    let listener: any;
    const setupListener = async () => {
      listener = await App.addListener('appStateChange', handleAppStateChange);
    };
    
    setupListener();
    
    return () => {
      if (listener?.remove) {
        listener.remove();
      }
    };
  }, [isScanning]);

  // Cleanup on route changes
  useEffect(() => {
    const cleanup = () => {
      if (isScanning) {
        stopGlobalScan();
      }
    };

    return cleanup;
  }, []);

  return {
    isScanning,
    handleGlobalScan,
    stopGlobalScan,
    handleScanResult,
  };
};
