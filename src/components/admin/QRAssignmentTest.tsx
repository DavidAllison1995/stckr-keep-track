import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { qrAssignmentService } from '@/services/qrAssignment';
import { supabase } from '@/integrations/supabase/client';

// QR Assignment Test Component - Updated to use Supabase Auth
export function QRAssignmentTest() {
  const [qrCode, setQrCode] = useState('');
  const [itemId, setItemId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id, name')
        .eq('user_id', user?.id)
        .limit(5);
      
      if (error) {
        console.error('Error fetching items:', error);
        return;
      }
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleTestAssignment = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    if (!qrCode || !itemId) {
      toast({
        title: 'Error',
        description: 'Please provide both QR code and item ID',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      console.log('=== QR ASSIGNMENT TEST ===');
      console.log('Testing QR assignment with:', { qrCode, itemId, userId: user.id });

      const result = await qrAssignmentService.assignQRCode(qrCode, itemId, user.id);

      console.log('Assignment result:', result);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'QR code assigned successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to assign QR code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('QR assignment test failed:', error);
      toast({
        title: 'Error',
        description: `Failed to assign QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCheckQRStatus = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    if (!qrCode) {
      toast({
        title: 'Error',
        description: 'Please provide a QR code',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      console.log('=== QR STATUS CHECK ===');
      console.log('Checking QR status for:', { qrCode, userId: user.id });

      const status = await qrAssignmentService.checkQRCode(qrCode, user.id);
      
      console.log('QR status result:', status);

      if (status.success && status.assigned) {
        toast({
          title: 'QR Code Status',
          description: `QR code is assigned to item: ${status.item?.name || 'Unknown item'}`,
        });
      } else if (status.success && !status.assigned) {
        toast({
          title: 'QR Code Status',
          description: 'QR code is not assigned to any item',
        });
      } else {
        toast({
          title: 'QR Code Status',
          description: 'Failed to check QR status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('QR status check failed:', error);
      toast({
        title: 'Error',
        description: `Failed to check QR status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>QR Assignment Test</CardTitle>
        <CardDescription>
          Test QR code assignment functionality for debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="qrCode">QR Code</Label>
          <Input
            id="qrCode"
            type="text"
            placeholder="Enter QR code (e.g., NGLJ9P)"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="itemId">Item ID</Label>
          <Input
            id="itemId"
            type="text"
            placeholder="Enter item ID"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
          {items.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Available items: {items.map(item => `${item.name} (${item.id})`).join(', ')}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTestAssignment}
            disabled={isAssigning || !qrCode || !itemId}
          >
            {isAssigning ? 'Assigning...' : 'Test Assignment'}
          </Button>
          
          <Button
            onClick={handleCheckQRStatus}
            disabled={isChecking || !qrCode}
            variant="outline"
          >
            {isChecking ? 'Checking...' : 'Check QR Status'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Available QR codes: GULMTB, YMY86V, WB7JMJ, ZXS55O, 30ZSHU, J0P6H8, SDEL42, LZQ0NW</p>
          <p>Check browser console for detailed debug logs</p>
        </div>
      </CardContent>
    </Card>
  );
}