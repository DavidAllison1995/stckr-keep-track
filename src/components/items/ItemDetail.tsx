
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/hooks/useSupabaseItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ItemDetailsTab from './ItemDetailsTab';
import ItemMaintenanceTab from './ItemMaintenanceTab';
import ItemDocumentsTab from './ItemDocumentsTab';

import QRSection from '@/components/qr/QRSection';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
  defaultTab?: string;
  highlightTaskId?: string;
}

const ItemDetail = ({ item, onClose, defaultTab = 'details', highlightTaskId }: ItemDetailProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const handleEdit = () => {
    navigate(`/items/edit/${item.id}`);
  };

  const handleClose = () => {
    onClose();
  };

  const handleItemUpdate = () => {
    // Trigger a refetch of item data
    window.location.reload(); // Simple approach - could be optimized with proper state management
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <p className="text-gray-500">{item.category} {item.room ? ` - ${item.room}` : ''}</p>
        </div>
        <div>
          <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Close
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <ItemDetailsTab item={item} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <ItemMaintenanceTab itemId={item.id} highlightTaskId={highlightTaskId} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ItemDocumentsTab itemId={item.id} />
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <QRSection
            itemId={item.id}
            qrCodeId={item.qr_code_id}
            onUpdate={handleItemUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItemDetail;
