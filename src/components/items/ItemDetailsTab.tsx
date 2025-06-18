
import { Item } from '@/hooks/useSupabaseItems';
import { Badge } from '@/components/ui/badge';
import { getIconComponent } from '@/components/icons';

interface ItemDetailsTabProps {
  item: Item;
}

const ItemDetailsTab = ({ item }: ItemDetailsTabProps) => {
  const IconComponent = getIconComponent(item.icon_id || 'box');

  return (
    <div className="space-y-6">
      {/* Item Photo/Icon */}
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        {item.photo_url ? (
          <img 
            src={item.photo_url} 
            alt={item.name} 
            className="w-full h-full object-cover rounded-lg" 
          />
        ) : (
          <IconComponent className="w-16 h-16 text-gray-600" />
        )}
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{item.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <Badge variant="secondary">{item.category}</Badge>
            </div>
            {item.room && (
              <div>
                <label className="text-sm font-medium text-gray-500">Room</label>
                <Badge variant="outline">{item.room}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1">{item.description}</p>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div>
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="text-gray-900 mt-1">{item.notes}</p>
          </div>
        )}

        {/* Dates */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Important Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.purchase_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                <p className="text-gray-900">{new Date(item.purchase_date).toLocaleDateString()}</p>
              </div>
            )}
            {item.warranty_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Warranty Until</label>
                <p className="text-gray-900">{new Date(item.warranty_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        {item.qr_code_id && (
          <div>
            <h3 className="font-semibold text-lg mb-2">QR Code</h3>
            <div>
              <label className="text-sm font-medium text-gray-500">Code ID</label>
              <p className="text-gray-900 font-mono">{item.qr_code_id}</p>
            </div>
          </div>
        )}

        {/* Documents */}
        {item.documents && item.documents.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Documents</h3>
            <div className="space-y-2">
              {item.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <Badge variant="outline">{doc.type}</Badge>
                  <span className="text-gray-900">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsTab;
