
export interface Document {
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

export interface ItemsContextType {
  items: Item[];
  isLoading: boolean;
  refetch: () => Promise<Item[]>;
  addItem: (item: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  uploadDocument: (itemId: string, file: File) => Promise<string>;
  deleteDocument: (documentUrl: string) => Promise<void>;
}
