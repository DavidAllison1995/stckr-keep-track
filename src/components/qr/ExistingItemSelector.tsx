
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2 } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';

interface ExistingItemSelectorProps {
  items: Item[];
  selectedItemId: string;
  onSelectedItemChange: (value: string) => void;
  onClaimToExisting: () => void;
  isClaiming: boolean;
}

const ExistingItemSelector = ({
  items,
  selectedItemId,
  onSelectedItemChange,
  onClaimToExisting,
  isClaiming,
}: ExistingItemSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Link2 className="w-4 h-4" />
        Or assign to existing item:
      </div>
      
      <Select value={selectedItemId} onValueChange={onSelectedItemChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an item..." />
        </SelectTrigger>
        <SelectContent>
          {items.length === 0 ? (
            <SelectItem value="no-items" disabled>
              No items available
            </SelectItem>
          ) : (
            items.map(item => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Button
        onClick={onClaimToExisting}
        disabled={!selectedItemId || isClaiming || selectedItemId === 'no-items'}
        variant="outline"
        className="w-full"
      >
        {isClaiming ? 'Assigning...' : 'Assign to Selected Item'}
      </Button>
    </div>
  );
};

export default ExistingItemSelector;
