
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';

interface ItemPhotoCardProps {
  item: Item;
}

const ItemPhotoCard = ({ item }: ItemPhotoCardProps) => {
  const IconComponent = getIconComponent(item.icon_id || 'box');

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardContent className="p-4">
        <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              alt={item.name} 
              className="w-full h-full object-contain rounded-xl" 
            />
          ) : (
            <IconComponent className="w-16 h-16 text-purple-400" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemPhotoCard;
