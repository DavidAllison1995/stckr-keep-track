
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { QrCode, Download } from 'lucide-react';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface CreateDeepLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDeepLinkModal = ({ isOpen, onClose }: CreateDeepLinkModalProps) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { items, updateItem } = useSupabaseItems();
  const { toast } = useToast();

  const availableItems = items.filter(item => !item.qr_code_id);

  const generateDeepLink = async () => {
    if (!selectedItemId) return;

    setGenerating(true);
    try {
      // Generate a new QR code token
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const webUrl = `https://stckr.io/qr/${newToken}`;

      // Update the item with the new QR code
      await updateItem(selectedItemId, {
        qr_code_id: newToken
      });

      // Generate QR code preview
      const qrDataUrl = await QRCode.toDataURL(webUrl, { 
        width: 256, 
        margin: 1 
      });
      setQrPreview(qrDataUrl);

      toast({
        title: "Deep Link Created",
        description: "QR code and deep link generated successfully",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to create deep link",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrPreview) return;

    const selectedItem = items.find(item => item.id === selectedItemId);
    const shortCode = selectedItem?.qr_code_id ? `B${selectedItem.qr_code_id.slice(-4).toUpperCase()}` : 'QR';

    const a = document.createElement('a');
    a.href = qrPreview;
    a.download = `qr-${shortCode}-${selectedItem?.name || 'item'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClose = () => {
    setSelectedItemId('');
    setQrPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Deep Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item">Select Item</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length === 0 ? (
                  <SelectItem value="" disabled>No items without QR codes</SelectItem>
                ) : (
                  availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {qrPreview && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">QR Code Preview</h4>
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <img 
                    src={qrPreview} 
                    alt="QR code preview" 
                    className="w-32 h-32"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {items.find(item => item.id === selectedItemId)?.name}
                </div>
              </div>

              <Button 
                onClick={downloadQrCode}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              {qrPreview ? 'Close' : 'Cancel'}
            </Button>
            {!qrPreview && (
              <Button 
                onClick={generateDeepLink} 
                disabled={!selectedItemId || generating}
              >
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDeepLinkModal;
