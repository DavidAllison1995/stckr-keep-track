import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { qrService } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { QRClaimFlow } from './QRClaimFlow';
import { Loader2 } from 'lucide-react';

interface QRScanHandlerProps {
  scannedCode: string;
  onComplete: () => void;
}

export const QRScanHandler = ({ scannedCode, onComplete }: QRScanHandlerProps) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [showClaimFlow, setShowClaimFlow] = useState(false);

  useEffect(() => {
    if (scannedCode && user) {
      handleScannedCode();
    }
  }, [scannedCode, user]);

  const handleScannedCode = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      const result = await qrService.checkQRAssignment(scannedCode);
      
      if (!result.success) {
        toast({
          title: "Error", 
          description: result.error || "Failed to check QR code",
          variant: "destructive",
        });
        onComplete();
        return;
      }

      if (!result.authenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to assign QR codes",
          variant: "destructive",
        });
        onComplete();
        return;
      }

      if (result.assigned && result.item) {
        navigate(`/items/${result.item.id}`);
        onComplete();
      } else {
        setShowClaimFlow(true);
      }
    } catch (error) {
      console.error('Error checking QR code:', error);
      toast({
        title: "Error",
        description: "Failed to process QR code. Please try again.",
        variant: "destructive",
      });
      onComplete();
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaimFlowClose = () => {
    setShowClaimFlow(false);
    onComplete();
  };

  if (isChecking) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 mx-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Processing QR Code</h3>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <QRClaimFlow
      qrKey={scannedCode}
      isOpen={showClaimFlow}
      onClose={handleClaimFlowClose}
    />
  );
};

export default QRScanHandler;