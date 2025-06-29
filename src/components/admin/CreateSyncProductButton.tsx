
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateSyncProductButtonProps {
  onSuccess?: () => void;
}

const CreateSyncProductButton: React.FC<CreateSyncProductButtonProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSyncProduct = async () => {
    setIsCreating(true);
    try {
      console.log('🔨 Creating Printful sync product...');
      
      // Generate unique external_id with timestamp
      const timestamp = Date.now();
      const uniqueExternalId = `sticker-sheet-${timestamp}`;
      
      const { data, error } = await supabase.functions.invoke('create-printful-sync-product', {
        body: {
          name: "Sticker Sheet #1",
          external_id: uniqueExternalId,
          thumbnail: "https://example.com/images/sticker-sheet-thumb.png",
          retail_price: "5.00",
          variant_id: 12917,
          print_file_url: "https://example.com/printfiles/sticker-sheet-design.png"
        }
      });
      
      if (error) {
        console.error('❌ SYNC PRODUCT CREATION ERROR:', error);
        toast({
          title: 'Sync Product Creation Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ SYNC PRODUCT CREATION RESULT:', data);
      
      if (data.success) {
        toast({
          title: 'Sync Product Created! ✅',
          description: `External ID: ${uniqueExternalId}, Sync Variant ID: ${data.sync_variant_id}`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Sync Product Creation Failed',
          description: data.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR creating sync product:', error);
      toast({
        title: 'Creation Error',
        description: 'Failed to create Printful sync product',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateSyncProduct}
      disabled={isCreating}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isCreating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Creating...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          Create Sync Product
        </>
      )}
    </Button>
  );
};

export default CreateSyncProductButton;
