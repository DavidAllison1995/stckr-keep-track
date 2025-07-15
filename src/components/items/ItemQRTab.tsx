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
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { QrCode, Trash2, Scan, Plus, Copy, Download } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';
import SimpleQRScanner from '@/components/qr/SimpleQRScanner';
import { globalQrService } from '@/services/globalQr';
import { qrGenerator } from '@/services/qrGenerator';

interface ItemQRTabProps {
  item: Item;
}

const ItemQRTab = ({ item }: ItemQRTabProps) => {
  const { updateItem } = useSupabaseItems();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Generate direct QR code data
  const directQRData = user ? qrGenerator.getItemQRCode(user.id, item.id) : null;

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
    // Generate white QR code on dark background with no white padding/fill
    const qrUrl = `https://stckr.app/qr/${code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrUrl)}&ecc=H&color=FFFFFF&bgcolor=1E1E2F&margin=0&qzone=1`;
  };

  const handleCopyQRUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'QR code URL copied to clipboard',
    });
  };

  const handleDownloadQR = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  // Always show QR code (use direct format or legacy)
  const isLegacyQR = Boolean(item.qr_code_id);
  const qrData = directQRData;
  const qrUrl = isLegacyQR ? `https://stckr.io/qr/${item.qr_code_id}` : qrData?.url;
  const qrImageUrl = isLegacyQR ? generateQRCodeImageUrl(item.qr_code_id!) : qrData?.qrCodeImageUrl;

  if (!qrData && !isLegacyQR) {
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Loading QR Code...</h3>
              <p className="text-gray-600 mb-6">
                Please wait while we generate your QR code.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR code display (direct format or legacy)
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#9333ea]" />
            QR Code {!isLegacyQR && <Badge variant="secondary" className="text-xs">Direct Link</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display with Dark Sticker Preview */}
          <div className="text-center">
            {/* Dark Sticker Preview - Optimized for Dark Backgrounds */}
            <div className="relative inline-block">
              {/* Dark sticker background matching generated QR background */}
              <div className="bg-[#1e1e2f] rounded-xl p-6 shadow-lg border-2 border-gray-600">
                <div className="relative">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Badge variant="secondary" className="text-sm font-mono bg-[#9333ea] text-white">
                {isLegacyQR ? item.qr_code_id : `${item.name} QR`}
              </Badge>
              <div className="text-xs text-gray-500 break-all">
                Deep link: {qrUrl}
              </div>
              <div className="text-xs text-[#9333ea] font-medium bg-purple-50 p-3 rounded">
                ✨ {isLegacyQR ? 'Legacy QR Code' : 'Direct item link'} - Optimized for mobile scanning
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleCopyQRUrl(qrUrl!)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </Button>
              
              <Button 
                onClick={() => handleDownloadQR(qrImageUrl!, `${item.name}-qr-code.png`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>

            {/* Legacy QR Code Management */}
            {isLegacyQR && (
              <>
                <Button 
                  onClick={() => setShowScanner(true)} 
                  className="w-full bg-[#9333ea] hover:bg-[#a855f7] text-white rounded-full font-medium"
                  disabled={isAssigning}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {isAssigning ? 'Assigning...' : 'Assign New QR Code'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-full"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Removing...' : 'Remove Legacy QR Code'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Legacy QR Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove the legacy QR code from this item? 
                        The QR sticker will become unassigned and can be used for other items.
                        The item will still have its direct QR code available.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteQR}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Removing...' : 'Remove Legacy QR Code'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Modal for Legacy QR Assignment */}
      {showScanner && (
        <SimpleQRScanner
          onScan={handleQRCodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default ItemQRTab;
