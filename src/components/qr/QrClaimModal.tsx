
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { globalQrService } from '@/services/globalQr';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Link2 } from 'lucide-react';
import ItemForm from '@/components/items/ItemForm';

interface QrClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeId: string;
}

const QrClaimModal = ({ isOpen, onClose, codeId }: QrClaimModalProps) => {
  const navigate = useNavigate();
  const { items } = useSupabaseItems();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userClaims, setUserClaims] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && codeId) {
      checkExistingClaims();
    }
  }, [isOpen, codeId]);

  const checkExistingClaims = async () => {
    try {
      const claims = await globalQrService.getUserClaims(codeId);
      setUserClaims(claims);
      
      if (claims.length > 0) {
        // User already has this code claimed, navigate to the item
        const claim = claims[0];
        toast({
          title: "Code Already Claimed",
          description: `This QR code is already assigned to "${claim.items?.name}"`,
        });
        navigate(`/items/${claim.item_id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error checking claims:', error);
    }
  };

  const handleClaimToExisting = async () => {
    if (!selectedItemId) return;

    setIsClaiming(true);
    try {
      await globalQrService.claimCode(codeId, selectedItemId);
      
      toast({
        title: "Success",
        description: "QR code assigned to item successfully",
      });
      
      navigate(`/items/${selectedItemId}`);
      onClose();
    } catch (error) {
      console.error('Failed to claim QR code:', error);
      toast({
        title: "Error",
        description: "Failed to assign QR code to item",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCreateNewItem = () => {
    setShowCreateForm(true);
  };

  const handleItemCreated = async (newItem: any) => {
    try {
      await globalQrService.claimCode(codeId, newItem.id);
      
      toast({
        title: "Success",
        description: "New item created and QR code assigned",
      });
      
      navigate(`/items/${newItem.id}`);
      onClose();
    } catch (error) {
      console.error('Failed to claim QR code for new item:', error);
      toast({
        title: "Error",
        description: "Item created but failed to assign QR code",
        variant: "destructive",
      });
    }
  };

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
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unassigned QR Code</h3>
            <p className="text-gray-600 text-sm">
              This QR code isn't linked to any of your items yet. What would you like to do?
            </p>
          </div>

          <div className="space-y-4">
            {/* Create New Item Option */}
            <Button
              onClick={handleCreateNewItem}
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
                  {items.length === 0 ? (
                    <SelectItem value="no-items" disabled>
                      No items available
                    </SelectItem>
                  ) : (
                    items.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleClaimToExisting}
                disabled={!selectedItemId || isClaiming || selectedItemId === 'no-items'}
                variant="outline"
                className="w-full"
              >
                {isClaiming ? 'Assigning...' : 'Assign to Selected Item'}
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

export default QrClaimModal;
