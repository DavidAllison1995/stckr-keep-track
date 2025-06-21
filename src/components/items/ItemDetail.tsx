
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/hooks/useSupabaseItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ItemDetailsTab from './ItemDetailsTab';
import ItemMaintenanceTab from './ItemMaintenanceTab';
import ItemDocumentsTab from './ItemDocumentsTab';
import ItemForm from './ItemForm';
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
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Trigger a refetch of item data
    window.location.reload(); // Simple approach - could be optimized with proper state management
  };

  const handleClose = () => {
    onClose();
  };

  const handleItemUpdate = () => {
    // Trigger a refetch of item data
    window.location.reload(); // Simple approach - could be optimized with proper state management
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isEditing) {
    return (
      <Card className="max-w-4xl mx-auto rounded-2xl shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Edit {item.name}</h2>
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
          <ItemForm item={item} onSuccess={handleEditSuccess} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto rounded-2xl shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b">
          <div>
            <h2 className="text-2xl font-semibold">{item.name}</h2>
            <div className="flex space-x-2 mt-1">
              <Badge variant="outline">{item.category}</Badge>
              {item.room && <Badge variant="outline">{item.room}</Badge>}
            </div>
          </div>
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
            Edit
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4 gap-4 bg-gray-50 p-1 rounded-lg">
            <TabsTrigger 
              value="details" 
              className="py-2 px-4 data-[state=active]:bg-blue-50 data-[state=active]:font-semibold"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="maintenance" 
              className="py-2 px-4 data-[state=active]:bg-blue-50 data-[state=active]:font-semibold"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="py-2 px-4 data-[state=active]:bg-blue-50 data-[state=active]:font-semibold"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="qr" 
              className="py-2 px-4 data-[state=active]:bg-blue-50 data-[state=active]:font-semibold"
            >
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <ItemDetailsTab item={item} onTabChange={handleTabChange} />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <ItemMaintenanceTab itemId={item.id} highlightTaskId={highlightTaskId} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <ItemDocumentsTab itemId={item.id} />
          </TabsContent>

          <TabsContent value="qr" className="mt-6">
            <QRSection
              itemId={item.id}
              qrCodeId={item.qr_code_id}
              onUpdate={handleItemUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default ItemDetail;
