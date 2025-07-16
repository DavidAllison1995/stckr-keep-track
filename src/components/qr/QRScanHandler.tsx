import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { qrAssignmentService } from '@/services/qrAssignment';
import { useToast } from '@/hooks/use-toast';
import { QRAssignModal } from './QRAssignModal';
import ItemForm from '@/components/items/ItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);

  useEffect(() => {
    if (scannedCode && user) {
      handleScannedCode();
    }
  }, [scannedCode, user]);

  const handleScannedCode = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      console.log('=== QR SCAN HANDLER ===');
      console.log('Processing scanned code:', scannedCode);

      const result = await qrAssignmentService.checkQRCode(scannedCode, user.id);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to check QR code",
          variant: "destructive",
        });
        onComplete();
        return;
      }

      if (result.assigned && result.item) {
        // QR code is already assigned to an item - navigate to item details
        toast({
          title: "QR Code Found",
          description: `Opening ${result.item.name}`,
          variant: "default",
        });
        navigate(`/items/${result.item.id}`);
        onComplete();
      } else {
        // QR code is not assigned - show assignment modal
        setShowAssignModal(true);
      }
    } catch (error) {
      console.error('Error processing scanned code:', error);
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

  const handleAssignmentSuccess = () => {
    setShowAssignModal(false);
    onComplete();
  };

  const handleCreateNewItem = () => {
    setShowAssignModal(false);
    setShowCreateItemModal(true);
  };

  const handleItemCreated = async () => {
    toast({
      title: "Success",
      description: "Item created successfully",
      variant: "default",
    });
    setShowCreateItemModal(false);
    onComplete();
  };

  const handleClose = () => {
    setShowAssignModal(false);
    setShowCreateItemModal(false);
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
    <>
      <QRAssignModal
        isOpen={showAssignModal}
        onClose={handleClose}
        onCreateNewItem={handleCreateNewItem}
        onSuccess={handleAssignmentSuccess}
        qrCode={scannedCode}
      />

      <Dialog open={showCreateItemModal} onOpenChange={setShowCreateItemModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            onSuccess={handleItemCreated}
            onCancel={() => setShowCreateItemModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanHandler;