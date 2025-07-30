
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Package, Printer, ArrowLeft } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/contexts/CartContext';
import { downloadPrintableStickers } from '@/utils/printableStickers';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CartDrawer from './CartDrawer';

const ShopPage = () => {
  const { products } = useShop();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = async (productId: string) => {
    const quantity = getQuantity(productId);
    await addToCart(productId, quantity);
    setQuantities(prev => ({ ...prev, [productId]: 1 }));
    
    // Auto-open cart drawer after adding item
    setIsCartOpen(true);
  };

  const handlePrintAtHome = async () => {
    try {
      await downloadPrintableStickers();
      toast({
        title: 'Download Started',
        description: 'Your printable sticker sheet is downloading.',
      });
    } catch (error) {
      console.error('Error downloading printable stickers:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download printable stickers. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b12]">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-40 bg-[#0b0b12]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Back Button + Title (Mobile) */}
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 text-white hover:bg-gray-800 md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Shop
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">
                  Get your QR code stickers and branded products
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Print at Home - Icon on mobile, full button on desktop */}
              <Button
                onClick={handlePrintAtHome}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-colors md:px-4"
              >
                <Printer className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Print at Home</span>
              </Button>
              
              {/* Cart Button */}
              <Button
                onClick={() => setIsCartOpen(true)}
                variant="outline"
                size="sm"
                className="border-purple-600 text-purple-400 hover:bg-purple-800 hover:text-white transition-colors md:px-4"
              >
                <ShoppingCart className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Products Section */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
              <Package className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No Products Available</h3>
            <p className="text-sm md:text-base text-gray-400 max-w-md">
              Products will appear here once they're added by administrators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group bg-gray-900/50 border-gray-800 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all duration-300 overflow-hidden animate-fade-in"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-800/50 flex items-center justify-center relative overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Icon */}
                  <div className={`w-20 h-20 md:w-24 md:h-24 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 ${product.image_url ? 'hidden' : ''}`}>
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>

                  {/* Price Badge - Mobile Overlay */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-sm font-bold text-green-400">
                      £{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-4">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-bold text-white text-base md:text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs md:text-sm text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Desktop Price Display */}
                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400 bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-700/30">
                      £{product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                        className="h-8 w-8 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={getQuantity(product.id)}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center text-sm border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-lg font-semibold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                        className="h-8 w-8 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full py-2.5 md:py-3 text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-200 font-semibold text-sm md:text-base hover-scale"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Print at Home Button - Mobile Only */}
      <div className="fixed bottom-20 right-4 z-30 md:hidden">
        <Button
          onClick={handlePrintAtHome}
          size="lg"
          className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 shadow-lg rounded-full p-3"
        >
          <Printer className="w-5 h-5" />
        </Button>
      </div>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ShopPage;
