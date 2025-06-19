
import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Item, ItemsContextType } from '@/types/item';
import { transformItemData } from '@/utils/itemTransform';
import { useAddItemMutation, useUpdateItemMutation, useDeleteItemMutation } from '@/services/itemMutations';
import { uploadDocument as uploadDocumentService, deleteDocument as deleteDocumentService } from '@/services/documentService';

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching items for user:', user.id);
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load items',
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Raw items data:', data);

      return (data || []).map(transformItemData);
    },
    enabled: !!user,
  });

  const addItemMutation = useAddItemMutation(user?.id);
  const updateItemMutation = useUpdateItemMutation(user?.id);
  const deleteItemMutation = useDeleteItemMutation(user?.id);

  const addItem = async (itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Item> => {
    const result = await addItemMutation.mutateAsync(itemData);
    return result;
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    await updateItemMutation.mutateAsync({ id, updates });
  };

  const deleteItem = async (id: string) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const getItemById = (id: string) => {
    const item = items.find(item => item.id === id);
    console.log('Getting item by ID:', id, 'found:', item);
    return item;
  };

  const uploadDocument = async (itemId: string, file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    return uploadDocumentService(user.id, itemId, file);
  };

  const deleteDocument = async (documentUrl: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    return deleteDocumentService(documentUrl);
  };

  const refetchItems = async () => {
    const result = await refetch();
    return result.data || [];
  };

  return (
    <ItemsContext.Provider value={{
      items,
      isLoading,
      refetch: refetchItems,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
      uploadDocument,
      deleteDocument,
    }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useSupabaseItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useSupabaseItems must be used within an ItemsProvider');
  }
  return context;
};

export { Item } from '@/types/item';
