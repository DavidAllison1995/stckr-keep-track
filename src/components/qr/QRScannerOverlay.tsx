
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import QRAssignmentModal from './QRAssignmentModal';
import ItemForm from '@/components/items/ItemForm';
import SimpleQRScanner from './SimpleQRScanner';

interface QRScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string | null;
}

const QRScannerOverlay = ({ isOpen, onClose, scannedCode }: QRScannerOverlayProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items } = useSupabaseItems();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (code: string) => {
    console.log('Processing scanned QR code:', code);
    setCurrentQrCode(code);
    processScannedCode(code);
  };

  const processScannedCode = async (code: string) => {
    setIsLoading(true);
    try {
      // Check if this QR code is already assigned to an item
      const existingItem = items.find(item => item.qr_code_id === code);
      
      if (existingItem) {
        console.log('QR code already assigned to item:', existingItem.id);
        toast({
          title: "Item Found",
          description: `QR code is assigned to "${existingItem.name}"`,
        });
        
        // Navigate to the existing item
        navigate(`/items/${existingItem.id}`);
        onClose();
        return;
      }

      // QR code is not assigned, show assignment options
      console.log('QR code not assigned, showing assignment modal');
      setShowAssignmentModal(true);
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast({
        title: "Error",
        description: "Failed to process QR code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewItem = () => {
    setShowAssignmentModal(false);
    setShowCreateItemModal(true);
  };

  const handleCreateItemSuccess = () => {
    setShowCreateItemModal(false);
    onClose();
  };

  const handleAssignmentClose = () => {
    setShowAssignmentModal(false);
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Processing QR code...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Main Scanner */}
      {isOpen && !showAssignmentModal && !showCreateItemModal && (
        <SimpleQRScanner onScan={handleScan} onClose={onClose} />
      )}

      {/* Assignment Modal */}
      <QRAssignmentModal
        isOpen={showAssignmentModal}
        onClose={handleAssignmentClose}
        onCreateNewItem={handleCreateNewItem}
        qrCode={currentQrCode}
      />

      {/* Add Item Modal */}
      <Dialog open={showCreateItemModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateItemModal(false);
          onClose();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            initialQrCode={currentQrCode}
            onSuccess={handleCreateItemSuccess}
            onCancel={() => {
              setShowCreateItemModal(false);
              onClose();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScannerOverlay;
