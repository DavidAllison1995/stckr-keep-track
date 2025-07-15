
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Monitor } from 'lucide-react';

const QRRedirectPage = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, getItemById } = useSupabaseItems();
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [assignedItem, setAssignedItem] = useState<any>(null);
  const [linkType, setLinkType] = useState<'legacy' | 'direct'>('legacy');

  // Detect device type for future deep linking
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'desktop';
  };

  const device = detectDevice();

  useEffect(() => {
    const checkQRCodeAssignment = async () => {
      setIsChecking(true);
      
      // If still loading auth state, wait
      if (isLoading) {
        return;
      }

      // Check if this is a direct link format (userID + itemID)
      const userID = searchParams.get('userID');
      const itemID = searchParams.get('itemID');
      
      if (userID && itemID) {
        // Direct link format: https://stckr.io/qr?userID={userID}&itemID={itemID}
        setLinkType('direct');
        
        if (!isAuthenticated) {
          navigate(`/auth?redirect=${encodeURIComponent(`/qr?userID=${userID}&itemID=${itemID}`)}`);
          return;
        }

        // Check if current user matches the userID and owns the item
        if (user?.id !== userID) {
          toast({
            title: "Access Denied",
            description: "This QR code belongs to a different user.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Find the item by ID
        const targetItem = getItemById(itemID);
        if (targetItem && targetItem.user_id === userID) {
          setAssignedItem(targetItem);
          // Show assigned item info briefly, then navigate
          setTimeout(() => {
            navigate(`/items/${targetItem.id}`);
          }, 2000);
        } else {
          toast({
            title: "Item Not Found",
            description: "The item linked to this QR code could not be found.",
            variant: "destructive",
          });
          navigate('/items');
        }
      } else if (code) {
        // Legacy format: https://stckr.io/qr/{code}
        setLinkType('legacy');
        
        if (!isAuthenticated) {
          navigate(`/auth?redirect=${encodeURIComponent(`/qr/${code}`)}`);
          return;
        }

        // Check if this QR code is already assigned to an item
        const existingItem = items.find(item => item.qr_code_id === code);
        
        if (existingItem) {
          setAssignedItem(existingItem);
          // Show assigned item info briefly, then navigate
          setTimeout(() => {
            navigate(`/items/${existingItem.id}`);
          }, 2000);
        } else {
          // QR code not assigned, show assignment UI
          setAssignedItem(null);
        }
      } else {
        // No valid parameters, redirect to home
        navigate('/');
        return;
      }
      
      setIsChecking(false);
    };

    checkQRCodeAssignment();
  }, [code, searchParams, items, navigate, toast, isAuthenticated, isLoading, user, getItemById]);

  const handleAssignQRCode = () => {
    // Navigate to scanner with the scanned code
    navigate('/scanner', { state: { scannedCode: code } });
  };

  const handleDownloadApp = () => {
    if (device === 'ios') {
      // Future: redirect to App Store
      toast({
        title: "Coming Soon",
        description: "iOS app will be available in the App Store soon",
      });
    } else if (device === 'android') {
      // Future: redirect to Play Store
      toast({
        title: "Coming Soon", 
        description: "Android app will be available in the Play Store soon",
      });
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : 'Checking QR code...'}
          </p>
        </div>
      </div>
    );
  }

  // Show assigned item briefly before redirecting
  if (assignedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-green-600">QR Code Found!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This QR code is assigned to:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{assignedItem.name}</h3>
              <p className="text-gray-600">{assignedItem.category}</p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to item details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR code not assigned - show assignment UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <CardTitle>Unassigned QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              This QR code (ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{code}</span>) is not assigned to any item yet.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Would you like to assign it to one of your items?
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAssignQRCode}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Assign to Item
            </Button>

            <Button 
              onClick={() => navigate('/items')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              View My Items
            </Button>
          </div>

          {/* Future deep linking preparation */}
          {device !== 'desktop' && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                {device === 'ios' ? <Smartphone className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                <span>Prefer using the mobile app?</span>
              </div>
              <Button 
                onClick={handleDownloadApp}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Get the {device === 'ios' ? 'iOS' : 'Android'} App (Coming Soon)
              </Button>
            </div>
          )}

          {device === 'desktop' && (
            <div className="pt-4 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Monitor className="w-4 h-4" />
                <span>Scan QR codes on mobile for the best experience</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRRedirectPage;
