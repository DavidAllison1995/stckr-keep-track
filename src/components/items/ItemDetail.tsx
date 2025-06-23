
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import ItemNotesTab from './ItemNotesTab';
import ItemQRTab from './ItemQRTab';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
  defaultTab?: string;
  highlightTaskId?: string;
}

const ItemDetail = ({ item, onClose, defaultTab = 'details', highlightTaskId }: ItemDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { deleteItem } = useSupabaseItems();
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize tab names - handle both 'maintenance' and 'tasks' as they refer to the same tab
  const normalizeTabName = (tabName: string) => {
    if (tabName === 'maintenance') return 'tasks';
    return tabName;
  };

  // Get the tab from URL params, falling back to defaultTab, and normalize it
  const urlTab = normalizeTabName(searchParams.get('tab') || defaultTab);
  console.log('ItemDetail - URL tab:', searchParams.get('tab'), 'Normalized to:', urlTab, 'Default tab:', defaultTab);

  // Initialize activeTab from normalized URL or defaultTab
  const [activeTab, setActiveTab] = useState(urlTab);

  // Update active tab when URL parameters change
  useEffect(() => {
    const tabParam = normalizeTabName(searchParams.get('tab') || defaultTab);
    console.log('ItemDetail - Tab param from URL:', searchParams.get('tab'), 'Normalized to:', tabParam, 'Current active tab:', activeTab);
    setActiveTab(tabParam);
  }, [searchParams, defaultTab]);

  // Log when activeTab changes
  useEffect(() => {
    console.log('ItemDetail - Active tab changed to:', activeTab);
  }, [activeTab]);

  const handleDeleteItem = async () => {
    try {
      // Check if we're on the standalone item detail page
      const isStandalonePage = location.pathname.includes(`/items/${item.id}`);
      
      // If on standalone page, navigate away first to prevent "item not found" error
      if (isStandalonePage) {
        navigate('/items', { replace: true });
      }
      
      // Delete the item (matches ItemCard approach)
      await deleteItem(item.id);
      
      // If in modal context, close the modal
      if (!isStandalonePage) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleTabChange = (value: string) => {
    console.log('ItemDetail - Tab changed to:', value);
    setActiveTab(value);
    
    // Update URL params without reloading - use the actual tab name in URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', value);
    setSearchParams(newSearchParams);
  };

  console.log('ItemDetail - Rendering with activeTab:', activeTab, 'item:', item?.name);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-optimized Header */}
        <div className="space-y-3 sm:space-y-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="flex-shrink-0 touch-target"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="mobile-text-xl sm:text-2xl font-bold truncate">{item.name}</h1>
                <p className="mobile-text-sm text-gray-600 truncate">{item.category}</p>
              </div>
            </div>
          </div>
          
          {/* Mobile-stacked Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="mobile-btn sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="mobile-btn sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm sm:max-w-md mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="mobile-text-lg">Delete Item</AlertDialogTitle>
                  <AlertDialogDescription className="mobile-text-base">
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    All maintenance tasks and documents associated with this item will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="mobile-btn">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteItem}
                    className="mobile-btn bg-red-600 hover:bg-red-700"
                  >
                    Delete Item
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Mobile-optimized Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="relative">
            <TabsList className="mobile-tabs-list">
              <TabsTrigger value="details" className="mobile-tab-trigger">Details</TabsTrigger>
              <TabsTrigger value="tasks" className="mobile-tab-trigger">Tasks</TabsTrigger>
              <TabsTrigger value="documents" className="mobile-tab-trigger">Docs</TabsTrigger>
              <TabsTrigger value="notes" className="mobile-tab-trigger">Notes</TabsTrigger>
              <TabsTrigger value="qr" className="mobile-tab-trigger">QR</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="mt-4 sm:mt-6">
            <ItemDetailsTab item={item} onTabChange={handleTabChange} />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-4 sm:mt-6">
            <ItemMaintenanceTab itemId={item.id} highlightTaskId={highlightTaskId} />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4 sm:mt-6">
            <ItemDocumentsTab itemId={item.id} />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4 sm:mt-6">
            <ItemNotesTab item={item} />
          </TabsContent>
          
          <TabsContent value="qr" className="mt-4 sm:mt-6">
            <ItemQRTab item={item} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="mobile-text-lg">Edit Item</DialogTitle>
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
