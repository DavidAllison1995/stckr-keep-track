
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';

interface RegenerateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

const RegenerateTokenModal = ({ isOpen, onClose, item }: RegenerateTokenModalProps) => {
  const [regenerating, setRegenerating] = useState(false);
  const { updateItem } = useSupabaseItems();
  const { toast } = useToast();

  if (!item) return null;

  const handleRegenerate = async () => {
    setRegenerating(true);

    try {
      // Generate a new QR code token
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await updateItem(item.id, {
        qr_code_id: newToken
      });

      toast({
        title: "Token Regenerated",
        description: `New QR code token generated for ${item.name}`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: "Unable to regenerate QR code token",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate QR Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will generate a new QR code token for "{item.name}". The old QR code will no longer work.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Current Token:</span>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                {item.qr_code_id?.slice(-8) || 'N/A'}
              </code>
            </div>
            <div className="text-sm text-gray-600">
              A new token will be generated and all URLs will be updated automatically.
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleRegenerate} 
              disabled={regenerating}
              variant="destructive"
            >
              {regenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Token'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateTokenModal;
