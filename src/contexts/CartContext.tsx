
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  printful_product_id: string | null;
  printful_variant_id: string | null;
  template_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getNewItemsCount: () => number;
  markCartAsViewed: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
  products: Product[];
}

export const CartProvider = ({ children, products }: CartProviderProps) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastViewedCount, setLastViewedCount] = useState(0);

  // Load cart items from database
  const loadCartItems = async (skipLogging = false) => {
    if (!user) {
      if (!skipLogging) console.log('No user, clearing cart');
      setCartItems([]);
      setLastViewedCount(0);
      return;
    }

    try {
      if (!skipLogging) console.log('Loading cart items for user:', user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart items:', error);
        throw error;
      }
      
      if (!skipLogging) console.log('Cart items loaded:', data);
      setCartItems(data || []);
      
      // Set initial viewed count to current count to avoid showing badge on first load
      if (data) {
        const totalCount = data.reduce((count, item) => count + item.quantity, 0);
        setLastViewedCount(totalCount);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    }
  };

  // Add to cart with INSTANT optimistic updates
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Adding to cart:', { productId, quantity, userId: user.id });
      
      // Find the product for optimistic update
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.product_id === productId);
      
      if (existingItemIndex >= 0) {
        console.log('Updating existing cart item');
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // INSTANT optimistic update - update immediately
        const updatedCartItems = [...cartItems];
        updatedCartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        };
        setCartItems(updatedCartItems);

        // Update in database (background operation)
        const { error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating cart item:', error);
          // Revert optimistic update on error
          loadCartItems(true);
          throw error;
        }
      } else {
        console.log('Inserting new cart item');
        
        // Create optimistic item with a temporary ID
        const optimisticItem: CartItem = {
          id: 'temp-' + Date.now() + '-' + Math.random(),
          user_id: user.id,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product
        };

        // INSTANT optimistic update - add to cart immediately
        const updatedCartItems = [...cartItems, optimisticItem];
        setCartItems(updatedCartItems);
        console.log('Cart immediately updated with optimistic item:', optimisticItem);

        // Insert new item in database (background operation)
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })
          .select(`
            *,
            product:products (*)
          `)
          .single();

        if (error) {
          console.error('Error inserting cart item:', error);
          // Revert optimistic update on error
          setCartItems(cartItems);
          throw error;
        }

        // Replace the temporary item with the real one
        setCartItems(prev => prev.map(item => 
          item.id === optimisticItem.id ? data : item
        ));
        console.log('Replaced optimistic item with real data:', data);
      }

      toast({
        title: 'Added to Cart',
        description: 'Item added successfully',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  // Update cart quantity with optimistic updates
  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      console.log('Updating cart quantity:', { cartItemId, quantity });
      
      // INSTANT optimistic update
      const optimisticCartItems = cartItems.map(item =>
        item.id === cartItemId ? { 
          ...item, 
          quantity,
          updated_at: new Date().toISOString()
        } : item
      );
      setCartItems(optimisticCartItems);

      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating cart quantity:', error);
        // Revert optimistic update on error
        loadCartItems(true);
        throw error;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive',
      });
    }
  };

  // Remove from cart with optimistic updates
  const removeFromCart = async (cartItemId: string) => {
    try {
      console.log('Removing from cart:', cartItemId);
      
      // INSTANT optimistic update
      const optimisticCartItems = cartItems.filter(item => item.id !== cartItemId);
      setCartItems(optimisticCartItems);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing from cart:', error);
        // Revert optimistic update on error
        loadCartItems(true);
        throw error;
      }
      
      toast({
        title: 'Removed',
        description: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) return;

    try {
      console.log('Clearing cart for user:', user.id);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
      setCartItems([]);
      setLastViewedCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate cart total
  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
    console.log('Cart total calculated:', total);
    return total;
  };

  // Get cart item count
  const getCartItemCount = () => {
    const count = cartItems.reduce((count, item) => count + item.quantity, 0);
    console.log('Cart item count:', count);
    return count;
  };

  // Get new items count (for badge)
  const getNewItemsCount = () => {
    const currentCount = getCartItemCount();
    const newItemsCount = Math.max(0, currentCount - lastViewedCount);
    console.log('New items count:', newItemsCount, 'current:', currentCount, 'lastViewed:', lastViewedCount);
    return newItemsCount;
  };

  // Mark cart as viewed (clear badge)
  const markCartAsViewed = () => {
    const currentCount = getCartItemCount();
    setLastViewedCount(currentCount);
    console.log('Cart marked as viewed, setting lastViewedCount to:', currentCount);
  };

  // Load cart when user changes
  useEffect(() => {
    console.log('CartProvider: User changed:', user?.id);
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
      setLastViewedCount(0);
    }
  }, [user]);

  // Debug useEffect to log cart items changes
  useEffect(() => {
    console.log('Cart items state updated:', cartItems);
  }, [cartItems]);

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getNewItemsCount,
    markCartAsViewed,
    isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
