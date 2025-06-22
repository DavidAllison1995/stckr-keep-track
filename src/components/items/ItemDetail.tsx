
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ItemForm from './ItemForm';
import ItemDetailsTab from './ItemDetailsTab';
import ItemMaintenanceTab from './ItemMaintenanceTab';
import ItemDocumentsTab from './ItemDocumentsTab';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
  defaultTab?: string;
  highlightTaskId?: string;
}

const ItemDetail = ({ item, onClose, defaultTab = 'details', highlightTaskId }: ItemDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { deleteItem } = useSupabaseItems();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDeleteItem = async () => {
    try {
      await deleteItem(item.id);
      
      // Check if we're on the item detail page (not in a modal)
      if (location.pathname.includes(`/items/${item.id}`)) {
        // We're on the standalone item page, navigate to items list
        navigate('/items');
      } else {
        // We're in a modal context, just close the modal
        onClose();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <p className="text-gray-600">{item.category}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    All maintenance tasks and documents associated with this item will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteItem}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Item
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <ItemDetailsTab item={item} />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <ItemMaintenanceTab itemId={item.id} highlightTaskId={highlightTaskId} />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <ItemDocumentsTab itemId={item.id} />
          </TabsContent>
          
          <TabsContent value="qr" className="mt-6">
            {/* QR Code content would go here */}
            <div className="text-center py-8 text-gray-500">
              QR Code functionality coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            item={item}
            onSuccess={() => setIsEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemDetail;
