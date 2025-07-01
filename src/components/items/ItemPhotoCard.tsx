
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/hooks/useSupabaseItems';
import TwemojiIcon from '@/components/icons/TwemojiIcon';

interface ItemPhotoCardProps {
  item: Item;
}

const ItemPhotoCard = ({ item }: ItemPhotoCardProps) => {
  const iconEmoji = item.icon_id || '📦';

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardContent className="p-4">
        <div className="w-full h-48 bg-gradient-to-br from-purple-900/20 via-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              alt={item.name} 
              className="w-full h-full object-contain rounded-xl" 
            />
          ) : (
            <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <TwemojiIcon emoji={iconEmoji} className="w-16 h-16" size={64} alt={`${item.name} icon`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemPhotoCard;
