
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Monitor, Loader2 } from 'lucide-react';
import { qrService } from '@/services/qrService';
import { QRClaimFlow } from '@/components/qr/QRClaimFlow';
import ItemForm from '@/components/items/ItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


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
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [showClaimFlow, setShowClaimFlow] = useState(false);
  
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

  // Smart app redirect function with proper deep link handling
  const attemptAppRedirect = (itemId: string) => {
    const universalLink = `https://stckr.io/item/${itemId}`;
    const appUrl = `com.stckr.keeptrack://item/${itemId}`;
    const fallbackUrl = `/items/${itemId}`;
    
    // For mobile devices, try universal link first (works for both app and web)
    if (device !== 'desktop') {
      console.log('Attempting universal link redirect to:', universalLink);
      
      // Use universal link which works for both installed app and web fallback
      window.location.href = universalLink;
      
      // Fallback timeout (in case of issues)
      setTimeout(() => {
        console.log('Universal link timeout, falling back to web:', fallbackUrl);
        navigate(fallbackUrl);
      }, 1500);
    } else {
      // Desktop - go directly to web version
      navigate(fallbackUrl);
    }
  };

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
        if (!isAuthenticated) {
          navigate(`/auth?redirect=${encodeURIComponent(`/qr?userID=${userID}&itemID=${itemID}`)}`);
          return;
        }

        // Check if current user matches the userID
        if (user?.id !== userID) {
          toast({
            title: "Access Denied",
            description: "This QR code belongs to a different user.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // For direct links, redirect directly to item
        console.log('Direct link detected, redirecting to item:', itemID);
        navigate(`/items/${itemID}`);
        return;
      } else if (cleanCode) {
        // QR code format: https://stckr.io/qr/{code}
        if (!isAuthenticated) {
          navigate(`/auth?redirect=${encodeURIComponent(`/qr/${cleanCode}`)}`);
          return;
        }

        try {
          // Log the scan for analytics
          await qrService.logQRScan(cleanCode, device, 'web');
          
          const result = await qrService.checkQRAssignment(cleanCode);
          
          if (!result.success) {
            toast({
              title: "Error",
              description: result.error || "Failed to check QR code",
              variant: "destructive",
            });
            navigate('/');
            return;
          }

          if (!result.authenticated) {
            // Not authenticated - redirect to auth with QR code in redirect
            navigate(`/auth?redirect=${encodeURIComponent(`/qr/${cleanCode}`)}`);
            return;
          }

          if (result.assigned && result.item) {
            // QR code is assigned to an item - redirect directly to item card
            console.log('QR code is assigned, redirecting to item:', result.item.id);
            attemptAppRedirect(result.item.id);
            return;
          } else {
            // QR code is not assigned - show assignment UI
            setShowClaimFlow(true);
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
  }, [code, cleanCode, searchParams, navigate, toast, isAuthenticated, isLoading, user]);

  const handleAssignQRCode = () => {
    setShowClaimFlow(true);
  };

  const handleClaimFlowClose = () => {
    setShowClaimFlow(false);
    navigate('/dashboard');
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
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : 'Checking QR code...'}
          </p>
        </div>
      </div>
    );
  }

  // This section is now removed since we redirect directly to item cards
  // instead of showing the holding page

  // QR code not assigned - show assignment UI
  return (
    <>
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

      <QRClaimFlow
        qrKey={cleanCode || ''}
        isOpen={showClaimFlow}
        onClose={handleClaimFlowClose}
      />
    </>
  );
};

export default QRRedirectPage;
