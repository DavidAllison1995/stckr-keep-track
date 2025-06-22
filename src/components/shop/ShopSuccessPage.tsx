
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShop } from '@/hooks/useShop';

const ShopSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart, loadOrders } = useShop();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart and reload orders after successful purchase
    if (sessionId) {
      clearCart();
      loadOrders();
    }
  }, [sessionId, clearCart, loadOrders]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Order Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase! Your order has been processed and you'll receive a confirmation email shortly.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Your order will be processed within 1-2 business days</li>
              <li>• You'll receive tracking information via email</li>
              <li>• QR stickers will be shipped to your address</li>
            </ul>
          </div>
          
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
            
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSuccessPage;
