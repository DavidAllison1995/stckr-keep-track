
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
  
  const [qrData, setQrData] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (code) {
      checkQRCode();
    }
  }, [code, user]);

  const checkQRCode = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          items (
            id,
            name
          )
        `)
        .eq('code', code)
        .single();

      if (error) {
        console.error('QR code not found:', error);
        setQrData(null);
        setIsLoading(false);
        return;
      }

      setQrData(data);

      // If assigned to current user, redirect to app
      if (data.assigned_user_id === user?.id && data.assigned_item_id) {
        window.location.href = `upkeep://item/${data.assigned_item_id}`;
        // Fallback for web
        setTimeout(() => {
          navigate(`/items/${data.assigned_item_id}`);
        }, 2000);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking QR code:', error);
      setQrData(null);
      setIsLoading(false);
    }
  };

  const claimQRCode = async () => {
    if (!selectedItemId || !user || !code) return;

    setIsClaiming(true);
    try {
      const { data, error } = await supabase.rpc('claim_qr', {
        p_code: code,
        p_user_id: user.id,
        p_item_id: selectedItemId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (result.success) {
        toast({
          title: 'Success!',
          description: 'QR code claimed successfully. Opening app...',
        });

        // Try to open in app
        window.location.href = `upkeep://item/${selectedItemId}`;
        
        // Fallback for web
        setTimeout(() => {
          navigate(`/items/${selectedItemId}`);
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to claim QR code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error claiming QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim QR code',
        variant: 'destructive',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading QR code...</span>
      </div>
    );
  }

  if (!qrData) {
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

  // If assigned to someone else
  if (qrData.assigned_user_id && qrData.assigned_user_id !== user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">QR Code Already Claimed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-gray-500" />
            <p className="text-gray-600">
              This QR code is owned by another user. Download the Upkeep app to manage your own items.
            </p>
            <Button 
              onClick={() => window.open('https://upkeep.app', '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Download Upkeep App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Claim interface
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Claim QR Sticker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600">
              Assign this QR sticker to one of your items:
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Item:</label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {items.length === 0 ? (
                  <SelectItem value="no-items" disabled>
                    No items available
                  </SelectItem>
                ) : (
                  items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={claimQRCode}
            disabled={!selectedItemId || isClaiming || selectedItemId === 'no-items'}
            className="w-full"
          >
            {isClaiming ? 'Claiming...' : 'Claim and Open in App'}
          </Button>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/items')}
              className="text-sm"
            >
              Manage Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRClaimPage;
