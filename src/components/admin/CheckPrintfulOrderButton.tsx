
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CheckPrintfulOrderButtonProps {
  orderId: string;
  printfulOrderId?: string | null;
}

const CheckPrintfulOrderButton: React.FC<CheckPrintfulOrderButtonProps> = ({ 
  orderId, 
  printfulOrderId 
}) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckOrder = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Checking Printful order status for:', orderId);
      
      const { data, error } = await supabase.functions.invoke('check-printful-order', {
        body: { orderId }
      });
      
      if (error) {
        console.error('❌ CHECK ORDER ERROR:', error);
        toast({
          title: 'Check Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ ORDER CHECK RESULT:', data);
      
      if (data.success) {
        const { order, printful_order_data, printful_error, all_printful_orders } = data;
        
        let message = `Order Status: ${order.status}\n`;
        message += `Printful Status: ${order.printful_status || 'None'}\n`;
        
        if (printful_order_data) {
          message += `Printful Order: ${printful_order_data.id} (${printful_order_data.status})\n`;
          message += `Dashboard: ${printful_order_data.dashboard_url || 'N/A'}`;
        } else if (printful_error) {
          message += `Printful Error: ${printful_error}`;
        } else {
          message += 'No Printful order found';
        }
        
        // Check if order exists in all orders list
        const foundInList = all_printful_orders.find(po => 
          po.external_id?.includes(order.id.substring(0, 8)) || 
          po.id.toString() === order.printful_order_id
        );
        
        if (foundInList && !printful_order_data) {
          message += `\nFound in list: Order ${foundInList.id} (${foundInList.status})`;
        }

        toast({
          title: 'Order Status Check',
          description: message,
        });

        // Open Printful dashboard if available
        if (printful_order_data?.dashboard_url) {
          window.open(printful_order_data.dashboard_url, '_blank');
        }
      } else {
        toast({
          title: 'Check Failed',
          description: data.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR checking order:', error);
      toast({
        title: 'Check Error',
        description: 'Failed to check Printful order status',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={handleCheckOrder}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
          Checking...
        </>
      ) : (
        <>
          <Search className="w-3 h-3 mr-1" />
          Check Status
        </>
      )}
    </Button>
  );
};

export default CheckPrintfulOrderButton;
