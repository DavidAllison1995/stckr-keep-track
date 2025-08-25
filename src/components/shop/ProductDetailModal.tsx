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
        {/* Hidden accessible title for all viewports */}
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
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

        <div className={`space-y-4 ${isMobile ? 'pb-4' : ''}`}>
          {/* Product Image */}
          <div className={`${isMobile ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-800/50 rounded-lg flex items-center justify-center relative overflow-hidden`}>
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
            <div className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} bg-purple-600 rounded-xl flex items-center justify-center shadow-lg ${product.image_url ? 'hidden' : ''}`}>
              <Package className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} text-white`} />
            </div>

            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-green-400`}>
                £{product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="bg-gray-800/30 rounded-lg p-3">
              <p className={`text-gray-300 leading-relaxed whitespace-pre-line ${isMobile ? 'text-sm' : 'text-sm'}`}>
                {product.description}
              </p>
            </div>
          )}
          {/* Quantity Controls and Add to Cart */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
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
                  className="h-8 w-8 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                  className={`${isMobile ? 'w-14 h-8' : 'w-16 h-8'} text-center border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-lg font-semibold text-sm`}
                />
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => updateQuantity(quantity + 1)}
                  className="h-8 w-8 p-0 rounded-lg border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Total Price */}
            <div className="text-center">
              <span className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Total: <span className="text-green-400 font-bold">£{(product.price * quantity).toFixed(2)}</span>
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className={`w-full ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'} text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-200 font-semibold`}
            >
              <ShoppingCart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
              Add {quantity} to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;