import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';

export const useQRScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRScanned = async (scannedText: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Normalize the QR code to canonical uppercase
      const qrKey = qrService.normalizeQRKey(scannedText);
      console.log('Processing QR scan:', { original: scannedText, normalized: qrKey });

      // Log the scan
      await qrService.logQRScan(qrKey, 'web', 'camera');

      // Navigate to canonical QR route - single entry point for all QR codes
      navigate(`/qr/${qrKey}`);
      
    } catch (error) {
      console.error('Error processing QR scan:', error);
      toast({
        title: "Error",
        description: "Failed to process QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleQRScanned,
    isProcessing
  };
};