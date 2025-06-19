
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQrClaim } from '@/hooks/useQrClaim';
import ItemForm from '@/components/items/ItemForm';
import QrClaimOptions from './QrClaimOptions';

interface QrClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeId: string;
}

const QrClaimModal = ({ isOpen, onClose, codeId }: QrClaimModalProps) => {
  const {
    items,
    selectedItemId,
    setSelectedItemId,
    isClaiming,
    showCreateForm,
    setShowCreateForm,
    handleClaimToExisting,
    handleCreateNewItem,
    handleItemCreated,
  } = useQrClaim(codeId, isOpen, onClose);

  if (showCreateForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            onSuccess={handleItemCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign QR Code {codeId}</DialogTitle>
        </DialogHeader>
        
        <QrClaimOptions
          codeId={codeId}
          items={items}
          selectedItemId={selectedItemId}
          onSelectedItemChange={setSelectedItemId}
          onClaimToExisting={handleClaimToExisting}
          onCreateNewItem={handleCreateNewItem}
          isClaiming={isClaiming}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QrClaimModal;
