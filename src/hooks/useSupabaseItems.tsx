
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

export interface Item {
  id: string;
  user_id: string;
  name: string;
  category: string;
  icon_id?: string;
  room?: string;
  description?: string;
  photo_url?: string;
  purchase_date?: string;
  warranty_date?: string;
  qr_code_id?: string;
  notes?: string;
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

interface ItemsContextType {
  items: Item[];
  isLoading: boolean;
  addItem: (item: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  uploadDocument: (itemId: string, file: File) => Promise<string>;
  deleteDocument: (documentUrl: string) => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
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

      return data || [];
    },
    enabled: !!user,
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...itemData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
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

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Item> }) => {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
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

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', user?.id] });
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

  const uploadDocument = async (itemId: string, file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${itemId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('item-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteDocument = async (documentUrl: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    // Extract file path from URL
    const urlParts = documentUrl.split('/');
    const filePath = urlParts.slice(-3).join('/'); // user_id/item_id/filename

    const { error } = await supabase.storage
      .from('item-documents')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addItemMutation.mutateAsync(itemData);
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    await updateItemMutation.mutateAsync({ id, updates });
  };

  const deleteItem = async (id: string) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return (
    <ItemsContext.Provider value={{
      items,
      isLoading,
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
