import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useNavigate } from 'react-router-dom';
import { qrService } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Link2, Check } from 'lucide-react';
import ItemForm from '@/components/items/ItemForm';

interface QRClaimFlowProps {
  qrKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRClaimFlow = ({ qrKey, isOpen, onClose }: QRClaimFlowProps) => {
  const { items } = useSupabaseItems();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAssignToExisting = async () => {
    if (!selectedItemId || !user) return;

    setIsClaiming(true);
    try {
      const result = await qrService.claimQRForItem(qrKey, selectedItemId);

      if (result.success) {
        toast({ title: "Success", description: "QR code assigned successfully" });
        navigate(`/items/${selectedItemId}`);
        onClose();
      } else {
        toast({ title: "Error", description: "Failed to assign QR code", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to assign QR code:', error);
      toast({ title: "Error", description: "Failed to assign QR code to item", variant: "destructive" });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCreateNewItem = () => {
    setShowCreateForm(true);
  };

  const handleItemCreated = async (created?: any) => {
    try {
      // If we received a created item with id (fallback), claim it
      if (created?.id) {
        const result = await qrService.claimQRForItem(qrKey, created.id);
        if (result.success) {
          toast({ title: "Success", description: "New item created and QR code assigned" });
          navigate(`/items/${created.id}`);
          onClose();
          return;
        }
        throw new Error('Failed to assign QR code');
      }

      // Otherwise, ItemForm is in collect-only mode and returned item data
      setIsClaiming(true);
      const newItemId = await qrService.createItemAndClaimQR(qrKey, {
        name: created?.name,
        category: created?.category,
        notes: created?.notes,
        photo_url: created?.photo_url,
        room: created?.room,
        description: created?.description,
        icon_id: created?.icon_id,
      });

      toast({ title: "Success", description: "New item created and QR code assigned" });
      navigate(`/items/${newItemId}`);
      onClose();
    } catch (error) {
      console.error('Failed to create item and assign QR:', error);
      toast({ title: "Error", description: "Item created but failed to assign QR code", variant: "destructive" });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId('');
    setShowCreateForm(false);
    onClose();
  };

  if (showCreateForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            onSuccess={handleItemCreated}
            onCancel={() => setShowCreateForm(false)}
            mode="collectOnly"
          />
        </DialogContent>
      </Dialog>
    );
  }

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
              {qrKey}
            </div>
          </div>

          <div className="space-y-4">
            {/* Create New Item Option */}
            <Button
              onClick={handleCreateNewItem}
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
                onClick={handleAssignToExisting}
                disabled={!selectedItemId || isClaiming || selectedItemId === 'no-items'}
                variant="outline"
                className="w-full"
              >
                {isClaiming ? (
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