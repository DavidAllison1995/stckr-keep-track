
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';

const QRClaimPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { items } = useSupabaseItems();
  const { toast } = useToast();
  
  const [qrExists, setQrExists] = useState<boolean | null>(null);
  const [userClaim, setUserClaim] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (code) {
      checkQRCodeAndClaim();
    }
  }, [code, user]);

  const checkQRCodeAndClaim = async () => {
    try {
      // First check if the master QR code exists
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, code')
        .eq('code', code)
        .single();

      if (qrError || !qrData) {
        setQrExists(false);
        setIsLoading(false);
        return;
      }

      setQrExists(true);

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if current user has claimed this code
      const { data: claimData, error: claimError } = await supabase
        .from('user_qr_claims')
        .select(`
          *,
          items (
            id,
            name
          )
        `)
        .eq('qr_code_id', qrData.id)
        .eq('user_id', user.id)
        .single();

      if (claimData) {
        setUserClaim(claimData);
        // User has already claimed this code, redirect to their item
        window.location.href = `upkeep://item/${claimData.item_id}`;
        // Fallback for web
        setTimeout(() => {
          navigate(`/items/${claimData.item_id}`);
        }, 2000);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking QR code:', error);
      setQrExists(false);
      setIsLoading(false);
    }
  };

  // Immediately redirect to new QR system
  useEffect(() => {
    if (code) {
      navigate(`/qr/${code}`, { replace: true });
    }
  }, [code, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading QR code...</span>
      </div>
    );
  }

  if (qrExists === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              This QR code was not found or is no longer valid.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-blue-500" />
            <p className="text-gray-600">
              Please sign in to claim this QR code and manage your items.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is redirecting to their claimed item
  if (userClaim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Opening Your Item</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-green-500" />
            <p className="text-gray-600">
              You have already claimed this QR code for "{userClaim.items?.name}". Opening in app...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show redirecting message
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Redirecting...</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Package className="w-16 h-16 mx-auto text-blue-500" />
          <p className="text-gray-600">
            Redirecting to the updated QR system...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRClaimPage;
