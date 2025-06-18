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
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      userId: '1',
      name: 'Kitchen Refrigerator',
      category: 'Appliance',
      iconId: 'fridge',
      room: 'Kitchen',
      description: 'Samsung French Door - Model RF28R7351SR',
      notes: '',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '1',
      name: 'MacBook Pro',
      category: 'Electronics',
      iconId: 'laptop',
      room: 'Office',
      description: '13-inch M2 - Serial: ABC123XYZ',
      notes: '',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]);

  const addItem = (itemData: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemById }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
