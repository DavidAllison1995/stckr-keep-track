
import { Item, Document } from '@/types/item';

export const transformItemData = (rawItem: any): Item => {
  let documents: Document[] = [];
  
  if (rawItem.documents) {
    try {
      let parsedDocuments: unknown;
      
      // Parse the JSONB documents field
      if (typeof rawItem.documents === 'string') {
        parsedDocuments = JSON.parse(rawItem.documents);
      } else {
        parsedDocuments = rawItem.documents;
      }
      
      // Type guard to ensure we have an array of valid documents
      if (Array.isArray(parsedDocuments)) {
        documents = parsedDocuments.filter((doc): doc is Document => {
          return typeof doc === 'object' && 
                 doc !== null && 
                 typeof (doc as any).id === 'string' &&
                 typeof (doc as any).name === 'string' &&
                 typeof (doc as any).type === 'string' &&
                 typeof (doc as any).url === 'string' &&
                 typeof (doc as any).uploadDate === 'string';
        });
      }
    } catch (error) {
      console.error('Error parsing documents for item:', rawItem.id, error);
      documents = [];
    }
  }
  
  return {
    ...rawItem,
    documents
  };
};
