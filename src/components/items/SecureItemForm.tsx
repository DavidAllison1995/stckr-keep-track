
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SecureInput from '@/components/forms/SecureInput';
import TwemojiIconPicker from '@/components/forms/TwemojiIconPicker';
import { validateDateInput, sanitizeInput } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';

interface SecureItemFormProps {
  onSubmit: (itemData: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

const SecureItemForm = ({ onSubmit, initialData, isLoading = false }: SecureItemFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    iconId: initialData?.icon_id || '📦',
    room: initialData?.room || '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
    purchaseDate: initialData?.purchase_date || '',
    warrantyDate: initialData?.warranty_date || '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Item name must be less than 100 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Date validation
    if (formData.purchaseDate && !validateDateInput(formData.purchaseDate)) {
      newErrors.purchaseDate = 'Please enter a valid purchase date';
    }

    if (formData.warrantyDate && !validateDateInput(formData.warrantyDate)) {
      newErrors.warrantyDate = 'Please enter a valid warranty date';
    }

    // Length validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    // Sanitize all text inputs
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      room: sanitizeInput(formData.room),
      description: sanitizeInput(formData.description),
      notes: sanitizeInput(formData.notes),
      icon_id: formData.iconId, // Map iconId to icon_id for consistency
    };

    onSubmit(sanitizedData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <SecureInput
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              maxLength={100}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Icon Picker */}
          <TwemojiIconPicker
            selectedEmoji={formData.iconId}
            onChange={(emoji) => handleInputChange('iconId', emoji)}
          />

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room/Location</Label>
            <SecureInput
              id="room"
              value={formData.room}
              onChange={(e) => handleInputChange('room', e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', sanitizeInput(e.target.value))}
              maxLength={500}
              rows={3}
            />
            <div className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </div>
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <SecureInput
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                sanitize={false}
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-600">{errors.purchaseDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyDate">Warranty Expiration</Label>
              <SecureInput
                id="warrantyDate"
                type="date"
                value={formData.warrantyDate}
                onChange={(e) => handleInputChange('warrantyDate', e.target.value)}
                sanitize={false}
              />
              {errors.warrantyDate && (
                <p className="text-sm text-red-600">{errors.warrantyDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', sanitizeInput(e.target.value))}
              maxLength={1000}
              rows={4}
              placeholder="Additional notes about this item..."
            />
            <div className="text-xs text-gray-500">
              {formData.notes.length}/1000 characters
            </div>
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : (initialData ? 'Update Item' : 'Add Item')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureItemForm;
