
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
import { useIsMobile } from '@/hooks/use-mobile';
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
  onItemUpdate?: () => void;
}

const ItemDetail = ({ item, onClose, defaultTab = 'details', highlightTaskId, onItemUpdate }: ItemDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { deleteItem } = useSupabaseItems();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const normalizeTabName = (tabName: string) => {
    if (tabName === 'maintenance') return 'tasks';
    return tabName;
  };

  const urlTab = normalizeTabName(searchParams.get('tab') || defaultTab);
  console.log('ItemDetail - URL tab:', searchParams.get('tab'), 'Normalized to:', urlTab, 'Default tab:', defaultTab);

  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    const tabParam = normalizeTabName(searchParams.get('tab') || defaultTab);
    console.log('ItemDetail - Tab param from URL:', searchParams.get('tab'), 'Normalized to:', tabParam, 'Current active tab:', activeTab);
    setActiveTab(tabParam);
  }, [searchParams, defaultTab]);

  useEffect(() => {
    console.log('ItemDetail - Active tab changed to:', activeTab);
  }, [activeTab]);

  const handleDeleteItem = async () => {
    try {
      const isStandalonePage = location.pathname.includes(`/items/${item.id}`);
      
      if (isStandalonePage) {
        navigate('/items', { replace: true });
      }
      
      await deleteItem(item.id);
      
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
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', value);
    setSearchParams(newSearchParams);
  };

  console.log('ItemDetail - Rendering with activeTab:', activeTab, 'item:', item?.name);

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 md:px-3">
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              {!isMobile && <span>Back</span>}
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{item.name}</h1>
              <p className="text-sm md:text-base text-gray-600">{item.category}</p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => setIsEditModalOpen(true)}
              className={isMobile ? "px-2" : ""}
            >
              <Edit className="w-4 h-4 md:mr-2" />
              {!isMobile && <span>Edit</span>}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className={`text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ${isMobile ? "px-2" : ""}`}
                >
                  <Trash2 className="w-4 h-4 md:mr-2" />
                  {!isMobile && <span>Delete</span>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={isMobile ? "max-w-sm mx-4" : ""}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    All maintenance tasks and documents associated with this item will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                  <AlertDialogCancel className={isMobile ? "w-full" : ""}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteItem}
                    className={`bg-red-600 hover:bg-red-700 ${isMobile ? "w-full" : ""}`}
                  >
                    Delete Item
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {isMobile ? (
            // Mobile tab layout - single scrollable list
            <TabsList className="grid w-full grid-cols-5 h-auto overflow-x-auto">
              <TabsTrigger value="details" className="text-xs py-2 px-2 whitespace-nowrap">Details</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs py-2 px-2 whitespace-nowrap">Tasks</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs py-2 px-2 whitespace-nowrap">Docs</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs py-2 px-2 whitespace-nowrap">Notes</TabsTrigger>
              <TabsTrigger value="qr" className="text-xs py-2 px-2 whitespace-nowrap">QR</TabsTrigger>
            </TabsList>
          ) : (
            // Desktop tab layout
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="details" className={isMobile ? "mt-4" : "mt-6"}>
            <ItemDetailsTab item={item} onTabChange={handleTabChange} />
          </TabsContent>
          
          <TabsContent value="tasks" className={isMobile ? "mt-4" : "mt-6"}>
            <ItemMaintenanceTab itemId={item.id} highlightTaskId={highlightTaskId} />
          </TabsContent>
          
          <TabsContent value="documents" className={isMobile ? "mt-4" : "mt-6"}>
            <ItemDocumentsTab itemId={item.id} />
          </TabsContent>
          
          <TabsContent value="notes" className={isMobile ? "mt-4" : "mt-6"}>
            <ItemNotesTab item={item} />
          </TabsContent>
          
          <TabsContent value="qr" className={isMobile ? "mt-4" : "mt-6"}>
            <ItemQRTab item={item} onQRStatusChange={onItemUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={`${isMobile ? 'max-w-sm mx-4' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
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
