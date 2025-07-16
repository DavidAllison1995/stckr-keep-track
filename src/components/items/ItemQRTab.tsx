import { useState, useEffect } from 'react';
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
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { QrCode, Trash2, Scan, Plus, Copy, Download } from 'lucide-react';
import { Item } from '@/types/item';
import SimpleQRScanner from '@/components/qr/SimpleQRScanner';
import { qrLinkingService, QRLinkStatus } from '@/services/qrLinking';

interface ItemQRTabProps {
  item: Item;
  onQRStatusChange?: () => void;
}

const ItemQRTab = ({ item, onQRStatusChange }: ItemQRTabProps) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [qrLinkStatus, setQrLinkStatus] = useState<QRLinkStatus>({ isLinked: false });
  const [isLoading, setIsLoading] = useState(true);

  // Load QR link status when component mounts
  useEffect(() => {
    if (user) {
      loadQRLinkStatus();
    }
  }, [user, item.id]);

  const loadQRLinkStatus = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const status = await qrLinkingService.getItemQRLink(item.id, user.id);
      setQrLinkStatus(status);
    } catch (error) {
      console.error('Error loading QR link status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQR = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await qrLinkingService.unlinkQRFromItem(item.id, user.id);
      setQrLinkStatus({ isLinked: false });
      toast({
        title: 'QR Code Removed',
        description: 'The QR code has been removed from this item.',
      });
      
      // Notify parent component of status change
      onQRStatusChange?.();
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
    if (!user) {
      console.error('No user found when trying to assign QR code');
      return;
    }
    
    console.log('=== QR CODE ASSIGNMENT DEBUG ===');
    console.log('Scanned code:', code);
    console.log('Item ID:', item.id);
    console.log('User ID:', user.id);
    
    setIsAssigning(true);
    try {
      await qrLinkingService.linkQRToItem(code, item.id, user.id);
      console.log('QR code linked successfully, refreshing status...');
      await loadQRLinkStatus(); // Refresh the status
      
      toast({
        title: 'Success',
        description: 'QR code assigned successfully',
      });
      
      // Notify parent component of status change
      onQRStatusChange?.();
      
      setShowScanner(false);
    } catch (error) {
      console.error('Error assigning QR code:', error);
      toast({
        title: 'Error',
        description: `Failed to assign QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const generateQRCodeImageUrl = (qrCodeId: string) => {
    // Generate white QR code on dark background with no white padding/fill
    const qrUrl = `https://stckr.io/qr/${qrCodeId}`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading QR code...</span>
      </div>
    );
  }

  // If no QR code is assigned, show placeholder message
  if (!qrLinkStatus.isLinked) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <QrCode className="w-12 h-12 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-foreground">No QR Code Assigned</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Scan an existing QR code to link it to this item
                </p>
              </div>
              <Button 
                onClick={() => setShowScanner(true)} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR code assigned - show QR code from new linking system
  const qrUrl = `https://stckr.io/qr/${qrLinkStatus.qrCodeId}`;
  const qrImageUrl = qrLinkStatus.imageUrl || generateQRCodeImageUrl(qrLinkStatus.qrCodeId!);

  // QR code display (direct format or legacy)
  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Status Badge */}
        <div className="text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full">
            QR Code Assigned
          </Badge>
        </div>

        {/* QR Code Display */}
        <div className="text-center">
          <Card className="inline-block shadow-xl border-0 bg-gradient-to-br from-background to-muted/20 p-8 rounded-2xl">
            <div className="relative">
              <div className="bg-[#1e1e2f] rounded-2xl p-8 shadow-inner">
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-56 h-56 mx-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => handleCopyQRUrl(qrUrl!)}
              variant="outline"
              className="flex items-center gap-2 py-6 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </Button>
            
            <Button 
              onClick={() => handleDownloadQR(qrImageUrl!, `${item.name}-qr-code.png`)}
              variant="outline"
              className="flex items-center gap-2 py-6 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* QR Code Management */}
          <div className="space-y-3">
            <Button 
              onClick={() => setShowScanner(true)} 
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              disabled={isAssigning}
            >
              <Scan className="w-4 h-4 mr-2" />
              {isAssigning ? 'Assigning...' : 'Assign New QR Code'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 hover:border-destructive/50 py-6 rounded-xl font-medium transition-all duration-200"
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
                    The QR code will become unassigned and can be used for other items.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteQR}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing...' : 'Remove QR Code'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal for QR Assignment */}
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
