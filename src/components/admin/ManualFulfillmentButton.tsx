
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManualFulfillmentButtonProps {
  orderId: string;
  orderStatus: string;
  printfulOrderId?: string | null;
  onSuccess?: () => void;
}

const ManualFulfillmentButton = ({ 
  orderId, 
  orderStatus, 
  printfulOrderId,
  onSuccess 
}: ManualFulfillmentButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManualFulfillment = async () => {
    setIsLoading(true);
    try {
      console.log('🔧 MANUAL FULFILLMENT: Triggering for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('printful-fulfillment', {
        body: { orderId }
      });

      if (error) {
        console.error('❌ MANUAL FULFILLMENT ERROR:', error);
        toast({
          title: 'Fulfillment Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ MANUAL FULFILLMENT SUCCESS:', data);
      toast({
        title: 'Fulfillment Triggered Successfully! 🎉',
        description: `Order sent to Printful. Printful Order ID: ${data.printfulOrderId}`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ MANUAL FULFILLMENT ERROR:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger fulfillment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if already processing or shipped
  if (orderStatus === 'processing' || orderStatus === 'shipped') {
    return null;
  }

  return (
    <Button
      onClick={handleManualFulfillment}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Send to Printful
        </>
      )}
    </Button>
  );
};

export default ManualFulfillmentButton;
