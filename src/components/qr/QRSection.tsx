
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { qrService } from '@/services/qr';
import { useToast } from '@/hooks/use-toast';
import { Trash2, QrCode } from 'lucide-react';

interface QRSectionProps {
  itemId: string;
  qrCodeId: string | null;
  onUpdate: () => void;
}

const QRSection = ({ itemId, qrCodeId, onUpdate }: QRSectionProps) => {
  const { toast } = useToast();
  const [isUnassigning, setIsUnassigning] = useState(false);

  const handleUnassign = async () => {
    setIsUnassigning(true);
    try {
      await qrService.unassignFromItem(itemId);
      toast({
        title: 'QR Code Unassigned',
        description: 'The QR code has been removed from this item.',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Unassign Failed',
        description: 'Unable to unassign QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUnassigning(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">QR Code</h3>
      
      {qrCodeId ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-gray-600" />
            <Badge variant="secondary">{qrCodeId}</Badge>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isUnassigning}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove QR Code?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will unassign the QR code from this item. The sticker will become unassigned and can be reassigned to any item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnassign}
                  disabled={isUnassigning}
                >
                  {isUnassigning ? 'Removing...' : 'Remove'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2">No QR code assigned</p>
          <p className="text-xs text-gray-400">
            Use the scanner to assign a QR code to this item
          </p>
        </div>
      )}
    </div>
  );
};

export default QRSection;
