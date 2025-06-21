
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useGlobalQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGlobalScan = () => {
    setIsScanning(true);
  };

  const stopGlobalScan = () => {
    setIsScanning(false);
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
    
    setIsScanning(false);
  };

  return {
    isScanning,
    handleGlobalScan,
    stopGlobalScan,
    handleScanResult,
  };
};
