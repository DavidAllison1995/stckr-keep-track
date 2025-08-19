import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Link2, Loader2 } from 'lucide-react';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { qrService } from '@/services/qrService';
import ItemForm from '@/components/items/ItemForm';

interface QRClaimFlowProps {
  qrKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRClaimFlow = ({ qrKey, isOpen, onClose }: QRClaimFlowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items } = useSupabaseItems();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleClaimToExisting = async () => {
    if (!selectedItemId) return;

    setIsClaiming(true);
    try {
      await qrService.claimQRForItem(qrKey, selectedItemId);
      
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
        description: error instanceof Error ? error.message : "Failed to assign QR code to item",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCreateNewItem = () => {
    setShowCreateForm(true);
  };

  const handleItemCreated = async (createdItem?: any) => {
    if (!createdItem) {
      console.error('No item provided to handleItemCreated');
      toast({
        title: "Error",
        description: "Failed to get created item",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await qrService.claimQRForItem(qrKey, createdItem.id);
      
      toast({
        title: "Success",
        description: "New item created and QR code assigned",
      });
      
      navigate(`/items/${createdItem.id}`);
      onClose();
    } catch (error) {
      console.error('Failed to claim QR code for new item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Item created but failed to assign QR code",
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
          <DialogTitle>Assign QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unassigned QR Code</h3>
            <p className="text-gray-600 text-sm mb-2">
              QR Code: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{qrKey}</span>
            </p>
            <p className="text-gray-600 text-sm">
              This QR code isn't linked to any of your items yet. What would you like to do?
            </p>
          </div>

          <div className="space-y-4">
            {/* Create New Item Option */}
            <Button
              onClick={handleCreateNewItem}
              className="w-full h-12 bg-primary hover:bg-primary/90"
              disabled={isClaiming}
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
              
              <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={isClaiming}>
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
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign to Selected Item'
                )}
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full" disabled={isClaiming}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};