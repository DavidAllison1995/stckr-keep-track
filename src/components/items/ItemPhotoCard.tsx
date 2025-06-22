
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';

interface ItemPhotoCardProps {
  item: Item;
}

const ItemPhotoCard = ({ item }: ItemPhotoCardProps) => {
  const IconComponent = getIconComponent(item.icon_id || 'box');

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              alt={item.name} 
              className="w-full h-full object-cover rounded-xl" 
            />
          ) : (
            <IconComponent className="w-16 h-16 text-blue-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemPhotoCard;
