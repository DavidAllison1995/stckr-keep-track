
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/contexts/CartContext';
import { downloadPrintableStickers } from '@/utils/printableStickers';
import { useToast } from '@/hooks/use-toast';
import CartDrawer from './CartDrawer';

const ShopPage = () => {
  const { products } = useShop();
  const { addToCart } = useCart();
  const { toast } = useToast();
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
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold text-white">
                Shop
              </h1>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Get your QR code stickers and Stckr-branded products
            </p>
            <div className="w-24 h-1 bg-purple-500 rounded-full mt-3"></div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePrintAtHome}
              className="bg-gray-900 border border-gray-700 text-white hover:bg-green-600 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              size="lg"
            >
              <Package className="w-5 h-5 mr-2" />
              Print at Home
            </Button>
            
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-gray-900 border border-gray-700 text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="p-12 text-center bg-gray-900 border-gray-800 shadow-xl">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Products Available</h3>
              <p className="text-gray-400 text-lg">
                Products will appear here once they're added by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gray-900 border-gray-800 hover:border-purple-500/50 relative"
              >
                {/* Purple accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                
                {/* Product Image Area */}
                <div className="aspect-square bg-gray-800 flex items-center justify-center relative overflow-hidden p-4">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon - shown when no image or image fails to load */}
                  <div className={`w-32 h-32 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${product.image_url ? 'hidden' : ''}`}>
                    <Package className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 space-y-6 pb-6">
                  {/* Price */}
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-400 bg-green-900/30 px-4 py-2 rounded-xl border border-green-700/50">
                      £{product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-300 block text-center">
                      Quantity
                    </label>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                        className="h-10 w-10 p-0 rounded-full border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={getQuantity(product.id)}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-20 h-10 text-center border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl font-semibold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                        className="h-10 w-10 p-0 rounded-full border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full py-3 text-white rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ShopPage;
