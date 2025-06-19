
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { globalQrService } from '@/services/globalQr';
import { useToast } from '@/hooks/use-toast';
import QrClaimModal from './QrClaimModal';

interface GlobalQRScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string | null;
}

const GlobalQRScannerOverlay = ({ isOpen, onClose, scannedCode }: GlobalQRScannerOverlayProps) => {
  const { toast } = useToast();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [codeId, setCodeId] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (scannedCode && isOpen) {
      handleScannedCode(scannedCode);
    }
  }, [scannedCode, isOpen]);

  const handleScannedCode = async (code: string) => {
    setIsChecking(true);
    try {
      console.log('Checking global QR code:', code);
      
      // Check if this is a valid global QR code
      const status = await globalQrService.checkStatus(code);
      
      if (!status.exists) {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not recognized or has been deactivated.",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Valid global QR code, show claim modal
      setCodeId(code);
      setShowClaimModal(true);
      
    } catch (error) {
      console.error('Error checking QR code:', error);
      toast({
        title: "Error",
        description: "Failed to process QR code. Please try again.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaimModalClose = () => {
    setShowClaimModal(false);
    onClose();
  };

  if (isChecking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Checking QR code...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <QrClaimModal
      isOpen={showClaimModal}
      onClose={handleClaimModalClose}
      codeId={codeId}
    />
  );
};

export default GlobalQRScannerOverlay;
