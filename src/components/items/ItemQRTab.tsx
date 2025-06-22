
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { QrCode, Trash2, Scan, Plus } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';
import QRScanner from '@/components/qr/QRScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { globalQrService } from '@/services/globalQr';

interface ItemQRTabProps {
  item: Item;
}

const ItemQRTab = ({ item }: ItemQRTabProps) => {
  const { updateItem } = useSupabaseItems();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDeleteQR = async () => {
    setIsDeleting(true);
    try {
      await updateItem(item.id, { qr_code_id: null });
      toast({
        title: 'QR Code Removed',
        description: 'The QR code has been removed from this item.',
      });
    } catch (error) {
      console.error('Error removing QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQRCodeScanned = async (code: string) => {
    setIsAssigning(true);
    try {
      // If item already has a QR code, we're reassigning
      if (item.qr_code_id) {
        // First remove the old QR code
        await updateItem(item.id, { qr_code_id: null });
      }

      // Try to claim the new QR code
      await globalQrService.claimCode(code, item.id);
      
      toast({
        title: 'Success',
        description: item.qr_code_id ? 'QR code reassigned successfully' : 'QR code assigned successfully',
      });
      
      setShowScanner(false);
    } catch (error) {
      console.error('Error assigning QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const generateQRCodeImageUrl = (code: string) => {
    // Generate QR code image URL using a QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://upkeep.lovable.app/claim/${code}`)}`;
  };

  if (!item.qr_code_id) {
    // No QR code assigned state
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No QR Code Assigned</h3>
              <p className="text-gray-600 mb-6">
                This item doesn't have a QR code assigned yet. Scan or assign a QR code to enable quick access.
              </p>
              <Button onClick={() => setShowScanner(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Assign QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner Modal */}
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Scan a QR sticker to assign it to this item.
              </p>
              <QRScanner
                onCodeScanned={handleQRCodeScanned}
                isActive={showScanner}
                isLoading={isAssigning}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // QR code assigned state
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
              <img
                src={generateQRCodeImageUrl(item.qr_code_id)}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  // Fallback to a simple QR code placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm font-mono">
                {item.qr_code_id}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setShowScanner(true)} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isAssigning}
            >
              <Scan className="w-4 h-4 mr-2" />
              {isAssigning ? 'Assigning...' : 'Assign New QR Code'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Removing...' : 'Remove QR Code'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove QR Code</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove the QR code from this item? 
                    The QR sticker will become unassigned and can be used for other items.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteQR}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing...' : 'Remove QR Code'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> This QR code links directly to this item. 
              Anyone who scans it will be taken to your item details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Modal for Reassignment */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign New QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan a new QR sticker to replace the current one. The old QR code will be removed automatically.
            </p>
            <QRScanner
              onCodeScanned={handleQRCodeScanned}
              isActive={showScanner}
              isLoading={isAssigning}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemQRTab;
