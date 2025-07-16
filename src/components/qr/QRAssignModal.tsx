import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { qrAssignmentService } from '@/services/qrAssignment';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Link2, Check } from 'lucide-react';

interface QRAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewItem: () => void;
  onSuccess?: () => void;
  qrCode: string;
}

export const QRAssignModal = ({ 
  isOpen, 
  onClose, 
  onCreateNewItem, 
  onSuccess,
  qrCode 
}: QRAssignModalProps) => {
  const { items } = useSupabaseItems();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignToExisting = async () => {
    if (!selectedItemId || !user) return;

    setIsAssigning(true);
    try {
      const result = await qrAssignmentService.assignQRCode(
        qrCode,
        selectedItemId,
        user.id
      );

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "QR code assigned successfully",
          variant: "default",
        });
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to assign QR code",
          variant: "destructive",
        });
      }
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

  const handleClose = () => {
    setSelectedItemId('');
    onClose();
  };

  // Filter items to only show those that don't have a QR code assigned
  const availableItems = items.filter(item => {
    // In the new system, items don't have qr_code_id
    // We'll need to check QR assignments separately if needed
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unassigned QR Code</h3>
            <p className="text-muted-foreground text-sm">
              This QR code isn't assigned to any of your items yet. What would you like to do?
            </p>
            <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {qrCode}
            </div>
          </div>

          <div className="space-y-4">
            {/* Create New Item Option */}
            <Button
              onClick={onCreateNewItem}
              className="w-full h-12"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Item
            </Button>

            {/* Assign to Existing Item */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Link2 className="w-4 h-4" />
                Or assign to existing item:
              </div>
              
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.length === 0 ? (
                    <SelectItem value="no-items" disabled>
                      No items available
                    </SelectItem>
                  ) : (
                    availableItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAssignToExisting}
                disabled={!selectedItemId || isAssigning || selectedItemId === 'no-items'}
                variant="outline"
                className="w-full"
              >
                {isAssigning ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Assign to Selected Item
                  </>
                )}
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRAssignModal;