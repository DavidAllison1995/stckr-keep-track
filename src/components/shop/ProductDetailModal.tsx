import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Package, X } from 'lucide-react';
import { Product } from '@/hooks/useShop';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const isMobile = useIsMobile();

  if (!product) return null;

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-gray-900 border-gray-800 text-white ${isMobile ? 'w-[95vw] max-w-none mx-auto' : 'max-w-2xl'} max-h-[90vh] overflow-auto`}>
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-800 -m-6 mb-4">
            <h2 className="text-lg font-semibold">Product Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <DialogHeader>
            <DialogTitle className="text-white">{product.name}</DialogTitle>
          </DialogHeader>
        )}

        <div className={`space-y-6 ${isMobile ? 'pb-4' : ''}`}>
          {/* Product Image */}
          <div className={`${isMobile ? 'aspect-square' : 'aspect-video'} bg-gray-800/50 rounded-lg flex items-center justify-center relative overflow-hidden`}>
            {product.image_url ? (
              <img 
                src={`${product.image_url}?v=${new Date(product.updated_at || product.created_at).getTime()}`} 
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback Icon */}
            <div className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} bg-purple-600 rounded-xl flex items-center justify-center shadow-lg ${product.image_url ? 'hidden' : ''}`}>
              <Package className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-white`} />
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
              <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-green-400`}>
                £{product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'} mb-2`}>
                {product.name}
              </h3>
              {product.description && (
                <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {product.description}
                </p>
              )}
            </div>

            {/* Price Display (Desktop) */}
            {!isMobile && (
              <div className="flex items-center justify-center py-2">
                <span className="text-3xl font-bold text-green-400 bg-green-900/20 px-4 py-2 rounded-lg border border-green-700/30">
                  £{product.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Quantity Controls and Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            {/* Quantity Controls */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-gray-300 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                Quantity:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => updateQuantity(quantity - 1)}
                  className="h-10 w-10 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                  className={`${isMobile ? 'w-16 h-10' : 'w-20 h-10'} text-center border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-lg font-semibold`}
                />
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => updateQuantity(quantity + 1)}
                  className="h-10 w-10 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Total Price */}
            <div className="text-center">
              <span className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Total: <span className="text-green-400 font-bold text-lg">£{(product.price * quantity).toFixed(2)}</span>
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className={`w-full ${isMobile ? 'py-3 text-base' : 'py-4 text-lg'} text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-200 font-semibold hover-scale`}
            >
              <ShoppingCart className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
              Add {quantity} to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;