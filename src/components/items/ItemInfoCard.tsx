
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
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
          <Package className="w-5 h-5 text-blue-600" />
          Item Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          {item.room && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-500 mb-1">Room</div>
                <div className="text-sm font-semibold text-gray-900">{item.room}</div>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4">
          {item.purchase_date && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-500 mb-1">Purchase Date</div>
                <div className="text-sm font-semibold text-gray-900">{formatDate(item.purchase_date)}</div>
              </div>
            </div>
          )}

          {item.warranty_date && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-500 mb-1">Warranty Until</div>
                <div className="text-sm font-semibold text-gray-900">{formatDate(item.warranty_date)}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemInfoCard;
