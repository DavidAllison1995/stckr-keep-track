
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';
import ExistingItemSelector from './ExistingItemSelector';

interface QrClaimOptionsProps {
  codeId: string;
  items: Item[];
  selectedItemId: string;
  onSelectedItemChange: (value: string) => void;
  onClaimToExisting: () => void;
  onCreateNewItem: () => void;
  isClaiming: boolean;
  onClose: () => void;
}

const QrClaimOptions = ({
  codeId,
  items,
  selectedItemId,
  onSelectedItemChange,
  onClaimToExisting,
  onCreateNewItem,
  isClaiming,
  onClose,
}: QrClaimOptionsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Unassigned QR Code</h3>
        <p className="text-gray-600 text-sm">
          This QR code isn't linked to any of your items yet. What would you like to do?
        </p>
      </div>

      <div className="space-y-4">
        {/* Create New Item Option */}
        <Button
          onClick={onCreateNewItem}
          className="w-full h-12 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Item
        </Button>

        {/* Assign to Existing Item */}
        <ExistingItemSelector
          items={items}
          selectedItemId={selectedItemId}
          onSelectedItemChange={onSelectedItemChange}
          onClaimToExisting={onClaimToExisting}
          isClaiming={isClaiming}
        />
      </div>

      <Button variant="outline" onClick={onClose} className="w-full">
        Cancel
      </Button>
    </div>
  );
};

export default QrClaimOptions;
