
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Item } from '@/types/item';
import { transformItemData } from '@/utils/itemTransform';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

export const useAddItemMutation = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerItemCreatedNotification } = useNotificationTriggers();

  return useMutation({
    mutationFn: async (itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!userId) throw new Error('User not authenticated');

      const { documents, ...itemWithoutDocuments } = itemData;
      
      console.log('Creating new item:', itemWithoutDocuments);
      
      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...itemWithoutDocuments,
          user_id: userId,
          documents: documents ? JSON.stringify(documents) : null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting item:', error);
        throw error;
      }
      
      console.log('Item created successfully:', data);
      return transformItemData(data);
    },
    onSuccess: async (newItem) => {
      console.log('Item mutation successful, triggering notification for:', newItem);
      
      // Invalidate queries first
      queryClient.invalidateQueries({ queryKey: ['items', userId] });
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
      
      // Trigger notification - await this to ensure it completes
      try {
        console.log('About to trigger item notification for:', { id: newItem.id, name: newItem.name });
        await triggerItemCreatedNotification(newItem.id, newItem.name);
        console.log('Item notification triggered successfully');
      } catch (notificationError) {
        console.error('Failed to create notification for new item:', notificationError);
        // Don't fail the whole operation if notification fails
      }
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateItemMutation = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Item> }) => {
      console.log('Updating item:', id, 'with:', updates);
      
      const { documents, ...updatesWithoutDocuments } = updates;
      
      const updateData: any = { ...updatesWithoutDocuments };
      if (documents !== undefined) {
        updateData.documents = documents && documents.length > 0 ? JSON.stringify(documents) : null;
        console.log('Storing documents as:', updateData.documents);
      }
      
      const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Updated item data:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['items', userId] });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteItemMutation = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', userId] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    },
  });
};
