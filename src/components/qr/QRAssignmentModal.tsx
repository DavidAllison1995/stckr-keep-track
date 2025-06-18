
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { qrService } from '@/services/qr';
import { useToast } from '@/hooks/use-toast';
import { getIconComponent } from '@/components/icons';
import { Plus, Search } from 'lucide-react';

interface QRAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
}

const QRAssignmentModal = ({ isOpen, onClose, qrCode }: QRAssignmentModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items } = useSupabaseItems();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedItemId) return;

    setIsAssigning(true);
    try {
      await qrService.assignToItem(qrCode, selectedItemId);
      toast({
        title: 'QR Code Assigned',
        description: 'Successfully assigned QR code to item.',
      });
      onClose();
      navigate(`/items/${selectedItemId}?tab=maintenance`);
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Unable to assign QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateNew = () => {
    onClose();
    navigate('/items?create=true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unassigned QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose an item to assign this code to, or create a new one.
          </p>

          {items.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">
                No items found—create one below
              </p>
              <Button onClick={handleCreateNew} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Item
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="search">Search Items</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredItems.map((item) => {
                      const IconComponent = getIconComponent(item.icon_id || 'box');
                      return (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{item.name}</span>
                            <span className="text-xs text-gray-500">({item.category})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAssign}
                  disabled={!selectedItemId || isAssigning}
                  className="flex-1"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Code'}
                </Button>
                <Button variant="outline" onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Item
                </Button>
              </div>
            </>
          )}

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRAssignmentModal;
