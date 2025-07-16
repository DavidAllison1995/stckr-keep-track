
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Monitor } from 'lucide-react';
import { qrLinkingService } from '@/services/qrLinking';


// Extract clean QR code from potentially malformed URL parameter
const extractCleanCode = (rawCode: string): string => {
  // If the code contains the full URL, extract just the code part
  if (rawCode.includes('https://stckr.io/qr/')) {
    const urlParts = rawCode.split('https://stckr.io/qr/');
    return urlParts[urlParts.length - 1]; // Get the last part (the actual code)
  }
  
  // If it contains query parameters, extract just the code
  if (rawCode.includes('?')) {
    return rawCode.split('?')[0];
  }
  
  // Return the code as-is if it's already clean
  return rawCode;
};

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
  
  // Extract clean code from potentially malformed URL parameter
  const cleanCode = code ? extractCleanCode(code) : null;

  // Detect device type for future deep linking
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'desktop';
  };

  const device = detectDevice();

  useEffect(() => {
    console.log('=== QR REDIRECT DEBUG ===');
    console.log('Raw URL:', window.location.href);
    console.log('Code from params:', code);
    console.log('Search params:', searchParams.toString());
    console.log('Clean code extracted:', cleanCode);
    
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
            // Show item card directly - no redirect needed
        } else {
          toast({
            title: "Item Not Found",
            description: "The item linked to this QR code could not be found.",
            variant: "destructive",
          });
          navigate('/items');
        }
      } else if (cleanCode) {
        // Legacy format: https://stckr.io/qr/{code}
        setLinkType('legacy');
        
        // Check if QR code is linked to an item for the current user
        if (!isAuthenticated) {
          navigate(`/auth?redirect=${encodeURIComponent(`/qr/${cleanCode}`)}`);
          return;
        }

        try {
          const qrLinkStatus = await qrLinkingService.getUserQRLink(cleanCode, user!.id);
          
          if (qrLinkStatus.isLinked && qrLinkStatus.itemId) {
            // QR code is linked to an item for this user
            const targetItem = getItemById(qrLinkStatus.itemId);
            
            if (targetItem) {
              setAssignedItem(targetItem);
              // Show item card directly - no redirect needed
            } else {
              toast({
                title: "Item Not Found",
                description: "The item linked to this QR code could not be found.",
                variant: "destructive",
              });
              navigate('/');
            }
          } else {
            // QR code is not linked to any item for this user
            // Show assignment UI
            setAssignedItem(null);
          }
        } catch (error) {
          console.error('Error checking QR code status:', error);
          toast({
            title: "Error",
            description: "Failed to check QR code status. Please try again.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      } else {
        // No valid parameters, redirect to home
        navigate('/');
        return;
      }
      
      setIsChecking(false);
    };

    checkQRCodeAssignment();
  }, [code, cleanCode, searchParams, items, navigate, toast, isAuthenticated, isLoading, user, getItemById]);

  const handleAssignQRCode = () => {
    // Navigate to scanner with the scanned code
    navigate('/scanner', { state: { scannedCode: cleanCode } });
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

  // Show assigned item card directly
  if (assignedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-green-600">Item Found!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignedItem.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{assignedItem.category}</p>
                {assignedItem.description && (
                  <p className="text-gray-700 mb-4">{assignedItem.description}</p>
                )}
              </div>
              
              {assignedItem.photo_url && (
                <div className="flex justify-center">
                  <img 
                    src={assignedItem.photo_url} 
                    alt={assignedItem.name}
                    className="max-w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedItem.room && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
                    <p className="text-gray-600">{assignedItem.room}</p>
                  </div>
                )}
                
                {assignedItem.purchase_date && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1">Purchase Date</h3>
                    <p className="text-gray-600">{new Date(assignedItem.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                
                {assignedItem.warranty_date && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1">Warranty Until</h3>
                    <p className="text-gray-600">{new Date(assignedItem.warranty_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {assignedItem.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-gray-600">{assignedItem.notes}</p>
                </div>
              )}
              
              <div className="text-center pt-4">
                <Button 
                  onClick={() => navigate('/items')}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  View All Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
              This QR code (ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{cleanCode}</span>) is not assigned to any item yet.
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
