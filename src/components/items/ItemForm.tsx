
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseItems, Item } from '@/hooks/useSupabaseItems';
import IconPicker from '@/components/IconPicker';

interface ItemFormProps {
  item?: Item;
  initialQrCode?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const ItemForm = ({ item, initialQrCode, onSuccess, onCancel }: ItemFormProps) => {
  const navigate = useNavigate();
  const { addItem, updateItem } = useSupabaseItems();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon_id: 'box',
    room: '',
    description: '',
    purchase_date: '',
    warranty_date: '',
    qr_code_id: initialQrCode || '',
  });

  const categories = ['Appliance', 'Electronics', 'Furniture', 'Vehicle', 'Tool', 'Other'];
  const rooms = ['Kitchen', 'Living Room', 'Bedroom', 'Office', 'Garage', 'Outdoors', 'Other'];

  // Pre-populate form when editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        icon_id: item.icon_id || 'box',
        room: item.room || '',
        description: item.description || '',
        purchase_date: item.purchase_date || '',
        warranty_date: item.warranty_date || '',
        qr_code_id: item.qr_code_id || '',
      });
    } else if (initialQrCode) {
      setFormData(prev => ({
        ...prev,
        qr_code_id: initialQrCode,
      }));
    }
  }, [item, initialQrCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      let newItem;
      
      if (item) {
        // Update existing item
        await updateItem(item.id, {
          name: formData.name.trim(),
          category: formData.category || 'Other',
          icon_id: formData.icon_id,
          room: formData.room || undefined,
          description: formData.description || undefined,
          purchase_date: formData.purchase_date || undefined,
          warranty_date: formData.warranty_date || undefined,
          qr_code_id: formData.qr_code_id || undefined,
        });
        newItem = item;
      } else {
        // Add new item
        newItem = await addItem({
          name: formData.name.trim(),
          category: formData.category || 'Other',
          icon_id: formData.icon_id,
          room: formData.room || undefined,
          description: formData.description || undefined,
          purchase_date: formData.purchase_date || undefined,
          warranty_date: formData.warranty_date || undefined,
          photo_url: undefined,
          qr_code_id: formData.qr_code_id || undefined,
          notes: undefined,
          documents: [],
        });
      }

      onSuccess();

      // If this was a new item created with a QR code, navigate to its detail page
      if (!item && initialQrCode && newItem) {
        setTimeout(() => {
          navigate(`/items/${newItem.id}`);
        }, 100);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Kitchen Refrigerator"
            required
          />
        </div>

        <IconPicker
          selectedIconId={formData.icon_id}
          onChange={(iconId) => setFormData(prev => ({ ...prev, icon_id: iconId }))}
        />

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="room">Room</Label>
          <Select value={formData.room} onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map(room => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Model, serial number, notes..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="warrantyDate">Warranty Until</Label>
            <Input
              id="warrantyDate"
              type="date"
              value={formData.warranty_date}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty_date: e.target.value }))}
            />
          </div>
        </div>

        {/* Hidden QR Code field - shows if there's a QR code */}
        {formData.qr_code_id && (
          <div>
            <Label htmlFor="qrCode">QR Code</Label>
            <Input
              id="qrCode"
              type="text"
              value={formData.qr_code_id}
              readOnly
              className="bg-gray-50"
              placeholder="QR Code will be assigned"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {item ? 'Update Item' : 'Create Item'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel || onSuccess}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
