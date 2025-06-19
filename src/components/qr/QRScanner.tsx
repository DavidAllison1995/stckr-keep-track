
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Scan, Zap } from 'lucide-react';
import SimpleQRScanner from './SimpleQRScanner';
import { qrService } from '@/services/qr';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import QRAssignmentModal from './QRAssignmentModal';
import ItemForm from '@/components/items/ItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const QRScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getItemById } = useSupabaseItems();
  const [showScanner, setShowScanner] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string>('');

  const handleScan = async (code: string) => {
    console.log('QR Code scanned:', code);
    
    try {
      const status = await qrService.getStatus(code);
      console.log('QR status:', status);
      
      if (status.isAssigned && status.itemId) {
        // Navigate to item details
        navigate(`/items/${status.itemId}?tab=maintenance`);
        setShowScanner(false);
        
        toast({
          title: "Item Found",
          description: `Opened ${status.itemName || 'item'}`,
        });
      } else {
        // Show assignment modal for unassigned QR codes
        setCurrentQrCode(code);
        setShowScanner(false);
        setShowAssignmentModal(true);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setShowScanner(false);
      
      toast({
        title: "Scan Error",
        description: "Unable to process this QR code",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewItem = () => {
    setShowAssignmentModal(false);
    setShowAddItemModal(true);
  };

  const handleAssignmentClose = () => {
    setShowAssignmentModal(false);
    setCurrentQrCode('');
  };

  const handleAddItemSuccess = () => {
    setShowAddItemModal(false);
    setCurrentQrCode('');
    toast({
      title: "Success",
      description: "Item created and QR code assigned!",
    });
  };

  const handleAddItemClose = () => {
    setShowAddItemModal(false);
    setCurrentQrCode('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">Scan QR codes to quickly access your items</p>
      </div>

      {/* Main Scanner Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <Scan className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Ready to Scan
              </h3>
              <p className="text-white/90 mb-8 max-w-sm mx-auto">
                Point your camera at any QR code sticker to instantly access item details
              </p>
              <Button 
                onClick={() => setShowScanner(true)}
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Instant Access</h4>
            <p className="text-sm text-gray-600">
              Get immediate access to item maintenance logs and details
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold mb-2">Smart Detection</h4>
            <p className="text-sm text-gray-600">
              Advanced QR code recognition with visual feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scan className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold mb-2">Easy Assignment</h4>
            <p className="text-sm text-gray-600">
              Link unassigned QR codes to your items in seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">How it works:</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <span className="text-sm text-gray-600">Tap "Start Scanning" to open the camera</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <span className="text-sm text-gray-600">Point your camera at any QR code sticker</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <span className="text-sm text-gray-600">View item details or assign unlinked codes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple QR Scanner */}
      {showScanner && (
        <SimpleQRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Assignment Modal */}
      <QRAssignmentModal
        isOpen={showAssignmentModal}
        onClose={handleAssignmentClose}
        onCreateNewItem={handleCreateNewItem}
        qrCode={currentQrCode}
      />

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm
            initialQrCode={currentQrCode}
            onSuccess={handleAddItemSuccess}
            onCancel={handleAddItemClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRScanner;
