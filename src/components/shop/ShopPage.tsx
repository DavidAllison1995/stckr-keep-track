
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from './CartDrawer';

const ShopPage = () => {
  const { products } = useShop();
  const { addToCart } = useCart();
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
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shop
              </h1>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Get your QR code stickers and Stckr-branded products
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-3"></div>
          </div>
          
          {/* Cart Button - NO BADGE */}
          <Button
            onClick={() => setIsCartOpen(true)}
            className="bg-white border-2 border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
          </Button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Products Available</h3>
              <p className="text-gray-500 text-lg">
                Products will appear here once they're added by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-blue-100 hover:border-blue-200"
              >
                {/* Product Image Area */}
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon - shown when no image or image fails to load */}
                  <div className={`w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${product.image_url ? 'hidden' : ''}`}>
                    <Package className="w-16 h-16 text-blue-500" />
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 space-y-6">
                  {/* Price */}
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block text-center">
                      Quantity
                    </label>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                        className="h-10 w-10 p-0 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={getQuantity(product.id)}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-20 h-10 text-center border-blue-200 focus:border-blue-400 focus:ring-blue-300 rounded-xl font-semibold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                        className="h-10 w-10 p-0 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full py-3 text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
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
