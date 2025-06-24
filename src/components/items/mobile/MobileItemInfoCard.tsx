
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/hooks/useSupabaseItems';
import { Calendar, MapPin, Package, Shield } from 'lucide-react';

interface MobileItemInfoCardProps {
  item: Item;
}

const MobileItemInfoCard = ({ item }: MobileItemInfoCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gray-900">
          <Package className="w-4 h-4 text-blue-600" />
          Item Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
          {item.room && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {item.room}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {item.purchase_date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Purchased: {formatDate(item.purchase_date)}</span>
            </div>
          )}
          
          {item.warranty_date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Warranty: {formatDate(item.warranty_date)}</span>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {item.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileItemInfoCard;
