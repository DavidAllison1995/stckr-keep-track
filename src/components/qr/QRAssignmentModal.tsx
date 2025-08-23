
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { qrService } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Link2 } from 'lucide-react';

interface QRAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewItem: () => void;
  qrCode: string;
}

const QRAssignmentModal = ({ isOpen, onClose, onCreateNewItem, qrCode }: QRAssignmentModalProps) => {
  const { items, updateItem } = useSupabaseItems();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignToExisting = async () => {
    if (!selectedItemId) return;

    setIsAssigning(true);
    try {
      // Use the v2 claiming system
      await qrService.claimQRForItem(qrCode, selectedItemId);
      
      toast({
        title: "Success",
        description: "QR code assigned to item successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to assign QR code:', error);
      toast({
        title: "Error",
        description: "Failed to assign QR code to item",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unlinked QR Code</h3>
            <p className="text-gray-600 text-sm">
              This QR code isn't linked to any item yet. What would you like to do?
            </p>
          </div>

          <div className="space-y-4">
            {/* Create New Item Option */}
            <Button
              onClick={onCreateNewItem}
              className="w-full h-12 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Item
            </Button>

            {/* Assign to Existing Item */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Link2 className="w-4 h-4" />
                Or assign to existing item:
              </div>
              
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item..." />
                </SelectTrigger>
                <SelectContent>
                  {items
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAssignToExisting}
                disabled={!selectedItemId || isAssigning}
                variant="outline"
                className="w-full"
              >
                {isAssigning ? 'Assigning...' : 'Assign to Selected Item'}
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRAssignmentModal;
