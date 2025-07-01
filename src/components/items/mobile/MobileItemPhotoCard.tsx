
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';

interface MobileItemPhotoCardProps {
  item: Item;
}

const MobileItemPhotoCard = ({ item }: MobileItemPhotoCardProps) => {
  const IconComponent = getIconComponent(item.icon_id || 'box');

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardContent className="p-3">
        <div className="w-full h-32 bg-gradient-to-br from-purple-900/20 via-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              alt={item.name} 
              className="w-full h-full object-contain rounded-lg" 
            />
          ) : (
            <div className="p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <IconComponent className="w-12 h-12" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileItemPhotoCard;
