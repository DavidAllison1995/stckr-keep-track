
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Info, Camera } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { getIconComponent } from '@/components/icons';
import ItemPhotoCard from './ItemPhotoCard';
import MobileItemPhotoCard from './mobile/MobileItemPhotoCard';
import ItemInfoCard from './ItemInfoCard';
import MobileItemInfoCard from './mobile/MobileItemInfoCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUpload from '@/components/forms/ImageUpload';

interface ItemDetailsTabProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const ItemDetailsTab = ({ item, onTabChange }: ItemDetailsTabProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { user } = useSupabaseAuth();
  const { updateItem } = useSupabaseItems();
  const isMobile = useIsMobile();
  const IconComponent = getIconComponent(item.icon_id || 'box');

  const handleImageChange = async (url: string | null) => {
    try {
      await updateItem(item.id, { photo_url: url || undefined });
      setIsImageModalOpen(false);
    } catch (error) {
      console.error('Failed to update item image:', error);
    }
  };

  const PhotoCard = isMobile ? MobileItemPhotoCard : ItemPhotoCard;
  const InfoCard = isMobile ? MobileItemInfoCard : ItemInfoCard;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Photo Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Photo</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              {item.photo_url ? 'Change Photo' : 'Add Photo'}
            </Button>
          </div>
          
          <div className="relative">
            {item.photo_url ? (
              <PhotoCard item={item} />
            ) : (
              <Card className="shadow-sm border border-gray-200">
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className={`w-full ${isMobile ? 'h-32' : 'h-48'} bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg flex items-center justify-center border border-gray-100`}>
                    <div className="text-center">
                      <IconComponent className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-blue-600 mx-auto mb-2`} />
                      <p className="text-sm text-gray-500">No photo added</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Details</h3>
          <InfoCard item={item} onTabChange={onTabChange} />
        </div>
      </div>

      {/* Image Upload Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className={`${isMobile ? 'max-w-sm mx-4' : 'max-w-md'}`}>
          <DialogHeader>
            <DialogTitle>Update Item Photo</DialogTitle>
          </DialogHeader>
          {user && (
            <ImageUpload
              currentImageUrl={item.photo_url || undefined}
              onImageChange={handleImageChange}
              userId={user.id}
              itemId={item.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemDetailsTab;
