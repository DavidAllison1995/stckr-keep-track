
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, ExternalLink } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    createCheckoutSession,
    isLoading
  } = useShop();

  const handleCheckout = async () => {
    console.log('Checkout button clicked, cart items:', cartItems.length);
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      onClose();
    }
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/shop');
  };

  const cartTotal = getCartTotal();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {cartItems.length === 0 
              ? "Your cart is empty"
              : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some products to get started!</p>
              <Button onClick={handleContinueShopping}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.product?.name || 'Product'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            ${item.product?.price?.toFixed(2) || '0.00'} each
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="px-3 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="secondary" className="text-sm font-medium">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Total & Checkout */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    'Creating checkout...'
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Checkout with Stripe
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to Stripe to complete your purchase
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
