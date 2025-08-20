import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Monitor, Loader2 } from 'lucide-react';
import { qrService } from '@/services/qrService';
import { QRClaimFlow } from '@/components/qr/QRClaimFlow';

const QRRedirectPage = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [showClaimFlow, setShowClaimFlow] = useState(false);
  const [qrExists, setQrExists] = useState(true);

  // Detect device type for future deep linking
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'desktop';
  };

  const device = detectDevice();

  const attemptAppRedirect = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  useEffect(() => {
    async function handleRedirect() {
      try {
        setIsChecking(true);
        console.log('=== QR REDIRECT V2 DEBUG ===');
        console.log('Raw URL:', window.location.href);
        console.log('Code from params:', code);

        // If still loading auth state, wait
        if (isLoading) {
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const userID = searchParams.get('userID');
        const itemID = searchParams.get('itemID');

        // Handle direct link format: ?userID=...&itemID=... (legacy support)
        if (userID && itemID) {
          console.log('Direct link detected (legacy):', { userID, itemID });
          if (user && user.id === userID) {
            attemptAppRedirect(itemID);
            return;
          } else if (!user) {
            navigate('/auth', { 
              state: { returnTo: window.location.pathname + window.location.search }
            });
            return;
          } else {
            toast({
              title: "Access Denied",
              description: "This item belongs to a different user.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }
        }

        // Handle standard QR code format: /qr/CODE
        if (!code) {
          toast({
            title: "Invalid QR Code",
            description: "No QR code provided.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Normalize the QR key using the single source of truth
        const normalizedKey = qrService.normalizeQRKey(code);
        console.log('Processing QR code:', { original: code, normalized: normalizedKey });

        // Log the scan for analytics
        await qrService.logQRScan(normalizedKey, device, 'web');

        if (!user) {
          console.log('User not authenticated, redirecting to login');
          navigate('/auth', { 
            state: { returnTo: `/qr/${normalizedKey}` }
          });
          return;
        }

        // Use the new unified assignment check with single source of truth
        const assignmentResult = await qrService.checkQRAssignment(normalizedKey);
        
        console.log('QR assignment result:', assignmentResult);

        if (!assignmentResult.success) {
          if (assignmentResult.error === 'QR code not found') {
            console.log('QR code not found in database');
            setQrExists(false);
          } else {
            console.error('Error checking QR assignment:', assignmentResult.error);
            toast({
              title: "Error",
              description: assignmentResult.error || "Failed to check QR code",
              variant: "destructive",
            });
            navigate('/');
          }
          return;
        }

        setQrExists(true);

        if (assignmentResult.assigned && assignmentResult.item) {
          console.log('QR code already assigned to user, redirecting to item');
          attemptAppRedirect(assignmentResult.item.id);
          return;
        }

        // QR code exists but not assigned to user - show claim flow
        console.log('QR code exists but not assigned, showing claim options');
        setShowClaimFlow(true);

      } catch (error) {
        console.error('Error in QR redirect:', error);
        toast({
          title: "Error",
          description: "Failed to process QR code. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    }

    handleRedirect();
  }, [code, user, navigate, toast, isLoading]);

  const handleAssignQRCode = () => {
    setShowClaimFlow(true);
  };

  const handleClaimFlowClose = () => {
    setShowClaimFlow(false);
    navigate('/dashboard');
  };

  const handleDownloadApp = () => {
    if (device === 'ios') {
      toast({
        title: "Coming Soon",
        description: "iOS app will be available in the App Store soon",
      });
    } else if (device === 'android') {
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

  // QR code doesn't exist
  if (!qrExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <QrCode className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <CardTitle className="text-red-700">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-600">
              This QR code is not valid or has been removed from the system.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR code exists but not assigned - show assignment UI
  const normalizedKey = code ? qrService.normalizeQRKey(code) : '';

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
                This QR code is not assigned to any item yet.
              </p>
              <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 px-2 py-1 rounded">
                {normalizedKey}
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
                  <Smartphone className="w-4 h-4" />
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
        qrKey={normalizedKey}
        isOpen={showClaimFlow}
        onClose={handleClaimFlowClose}
      />
    </>
  );
};

export default QRRedirectPage;