import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface QRScanHandlerProps {
  scannedCode: string;
  onComplete: () => void;
}

export const QRScanHandler = ({ scannedCode, onComplete }: QRScanHandlerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const process = async () => {
      if (!scannedCode) return;
      try {
        const qrKey = qrService.normalizeQRKey(scannedCode);
        await qrService.logQRScan(qrKey, 'web', 'camera');
        navigate(`/qr/${qrKey}`);
      } catch (e) {
        console.error('Error handling scanned QR:', e);
        toast({
          title: 'Error',
          description: 'Failed to process QR code. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
        onComplete();
      }
    };
    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedCode]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 mx-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Processing QR Code</h3>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default QRScanHandler;