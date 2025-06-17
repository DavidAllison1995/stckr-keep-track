
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useItems } from '@/hooks/useItems';

interface ItemFormProps {
  onSuccess: () => void;
}

const ItemForm = ({ onSuccess }: ItemFormProps) => {
  const { addItem } = useItems();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    room: '',
    description: '',
    purchaseDate: '',
    warrantyDate: '',
  });

  const categories = ['Appliance', 'Electronics', 'Furniture', 'Vehicle', 'Tool', 'Other'];
  const rooms = ['Kitchen', 'Living Room', 'Bedroom', 'Office', 'Garage', 'Outdoors', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    addItem({
      name: formData.name.trim(),
      category: formData.category || 'Other',
      room: formData.room || undefined,
      description: formData.description || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      warrantyDate: formData.warrantyDate || undefined,
    });

    onSuccess();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
        <p className="text-gray-600">Fill in the details below</p>
      </div>

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
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="warrantyDate">Warranty Until</Label>
            <Input
              id="warrantyDate"
              type="date"
              value={formData.warrantyDate}
              onChange={(e) => setFormData(prev => ({ ...prev, warrantyDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Add Item
          </Button>
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
