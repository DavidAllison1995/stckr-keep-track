
import { createContext, useContext, useState, ReactNode } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

export interface Item {
  id: string;
  userId: string;
  name: string;
  category: string;
  iconId?: string;
  room?: string;
  description?: string;
  photoUrl?: string;
  purchaseDate?: string;
  warrantyDate?: string;
  qrCodeId?: string;
  notes?: string;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

interface ItemsContextType {
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: ReactNode }) => {
  console.warn('DEPRECATED: useItems hook is deprecated. Use useSupabaseItems instead.');
  
  // Return empty data to prevent errors but encourage migration
  const [items] = useState<Item[]>([]);

  const addItem = () => {
    console.error('DEPRECATED: Use useSupabaseItems.addItem instead');
  };

  const updateItem = () => {
    console.error('DEPRECATED: Use useSupabaseItems.updateItem instead');
  };

  const deleteItem = () => {
    console.error('DEPRECATED: Use useSupabaseItems.deleteItem instead');
  };

  const getItemById = () => {
    console.error('DEPRECATED: Use useSupabaseItems.getItemById instead');
    return undefined;
  };

  const contextValue = { items, addItem, updateItem, deleteItem, getItemById };

  return (
    <ItemsContext.Provider value={contextValue}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  console.warn('DEPRECATED: useItems hook is deprecated. Use useSupabaseItems instead.');
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider - DEPRECATED: Use useSupabaseItems instead');
  }
  return context;
};
