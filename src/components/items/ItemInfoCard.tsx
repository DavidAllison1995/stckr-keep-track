
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Package } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';

interface ItemInfoCardProps {
  item: Item;
}

const ItemInfoCard = ({ item }: ItemInfoCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardHeader className="pb-3 mobile-compact-p">
        <CardTitle className="text-lg mobile-text-sm flex items-center mobile-tight-gap gap-2 text-white">
          <Package className="w-5 h-5 mobile-icon-md text-purple-400" />
          Item Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 mobile-tight-space mobile-compact-p">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          {item.room && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-gray-700">
                <MapPin className="w-4 h-4 text-gray-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-400 mb-1">Room</div>
                <div className="text-sm font-semibold text-white">{item.room}</div>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4">
          {item.purchase_date && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-purple-700/50">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-400 mb-1">Purchase Date</div>
                <div className="text-sm font-semibold text-white">{formatDate(item.purchase_date)}</div>
              </div>
            </div>
          )}

          {item.warranty_date && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-purple-700/50">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-400 mb-1">Warranty Until</div>
                <div className="text-sm font-semibold text-white">{formatDate(item.warranty_date)}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemInfoCard;
