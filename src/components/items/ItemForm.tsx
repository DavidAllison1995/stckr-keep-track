import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useSupabaseItems, Item } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import NotoEmojiIconPicker from '@/components/forms/NotoEmojiIconPicker';
import ImageUpload from '@/components/forms/ImageUpload';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface ItemFormProps {
  item?: Item;
  initialQrCode?: string;
  onSuccess: (createdItem?: Item) => void;
  onCancel?: () => void;
  mode?: 'normal' | 'collectOnly';
}

const ItemForm = ({ item, initialQrCode, onSuccess, onCancel, mode = 'normal' }: ItemFormProps) => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { addItem, updateItem } = useSupabaseItems();
  const { checkItemLimit, UpgradeModalComponent } = useSubscriptionLimits();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon_id: '📦', // Default to package emoji
    room: '',
    description: '',
    purchase_date: '',
    warranty_date: '',
    qr_code_id: initialQrCode || '',
    photo_url: '',
  });

  const categories = ['Appliance', 'Electronics', 'Furniture', 'Vehicle', 'Tool', 'Other'];
  const rooms = ['Kitchen', 'Living Room', 'Bedroom', 'Office', 'Garage', 'Outdoors', 'Other'];

  // Pre-populate form when editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        icon_id: item.icon_id || '📦',
        room: item.room || '',
        description: item.description || '',
        purchase_date: item.purchase_date || '',
        warranty_date: item.warranty_date || '',
        qr_code_id: item.qr_code_id || '',
        photo_url: item.photo_url || '',
      });
    } else if (initialQrCode) {
      setFormData(prev => ({
        ...prev,
        qr_code_id: initialQrCode,
      }));
    }
  }, [item, initialQrCode]);

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({ ...prev, photo_url: url || '' }));
  };

  const handlePurchaseDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      purchase_date: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleWarrantyDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      warranty_date: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    // If in collectOnly mode, just return the form data without creating an item
    if (mode === 'collectOnly') {
      onSuccess({
        name: formData.name.trim(),
        category: formData.category || 'Other',
        icon_id: formData.icon_id,
        room: formData.room || undefined,
        description: formData.description || undefined,
        photo_url: formData.photo_url || undefined,
      } as any);
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
          photo_url: formData.photo_url || undefined,
        });
        newItem = item;
      } else {
        // Check item limit for new items
        if (!checkItemLimit()) {
          return;
        }
        
        // Add new item
        newItem = await addItem({
          name: formData.name.trim(),
          category: formData.category || 'Other',
          icon_id: formData.icon_id,
          room: formData.room || undefined,
          description: formData.description || undefined,
          purchase_date: formData.purchase_date || undefined,
          warranty_date: formData.warranty_date || undefined,
          photo_url: formData.photo_url || undefined,
          notes: undefined,
          documents: [],
        });
      }

      onSuccess(newItem);

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

  // Generate a temporary ID for new items for image upload
  const itemIdForUpload = item?.id || `temp-${Date.now()}`;

  return (
    <div className="space-y-6">
      <UpgradeModalComponent />
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

        {/* Image Upload Section */}
        {user && (
          <ImageUpload
            currentImageUrl={formData.photo_url}
            onImageChange={handleImageChange}
            userId={user.id}
            itemId={itemIdForUpload}
          />
        )}

        {/* Noto Emoji Icon Picker */}
        <NotoEmojiIconPicker
          selectedEmoji={formData.icon_id}
          onChange={(emoji) => setFormData(prev => ({ ...prev, icon_id: emoji }))}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <DatePicker
              id="purchaseDate"
              date={formData.purchase_date}
              onDateChange={handlePurchaseDateChange}
              placeholder="Select purchase date"
            />
          </div>
          
          <div>
            <Label htmlFor="warrantyDate">Warranty Until</Label>
            <DatePicker
              id="warrantyDate"
              date={formData.warranty_date}
              onDateChange={handleWarrantyDateChange}
              placeholder="Select warranty date"
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
