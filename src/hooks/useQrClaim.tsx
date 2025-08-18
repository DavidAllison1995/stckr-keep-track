
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { globalQrService } from '@/services/globalQr';
import { useToast } from '@/hooks/use-toast';

export const useQrClaim = (codeId: string, isOpen: boolean, onClose: () => void) => {
  const navigate = useNavigate();
  const { items, refetch } = useSupabaseItems();
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
      await globalQrService.claimCode(codeId, createdItem.id);
      
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
        description: "Item created but failed to assign QR code",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    selectedItemId,
    setSelectedItemId,
    isClaiming,
    showCreateForm,
    setShowCreateForm,
    userClaims,
    handleClaimToExisting,
    handleCreateNewItem,
    handleItemCreated,
  };
};
