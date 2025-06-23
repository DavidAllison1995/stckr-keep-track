
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

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

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  status: string;
  total_amount: number;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  qr_tokens: any;
  product?: Product;
}

export const useShop = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        throw error;
      }
      
      console.log('Products loaded:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  // Load cart items with optimistic updates
  const loadCartItems = async (skipLogging = false) => {
    if (!user) {
      if (!skipLogging) console.log('No user, skipping cart load');
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

  // Create checkout session
  const createCheckoutSession = async () => {
    if (!user || cartItems.length === 0) {
      console.log('Cannot create checkout session:', { user: !!user, cartItems: cartItems.length });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('Creating checkout session with items:', cartItems);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price || 0,
            name: item.product?.name || 'Product',
          })),
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }
      console.log('Checkout session created:', data);
      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user orders
  const loadOrders = async () => {
    if (!user) return;

    try {
      console.log('Loading orders for user:', user.id);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        throw error;
      }
      console.log('Orders loaded:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Get order status display info
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending Payment', color: 'yellow', description: 'Waiting for payment confirmation' };
      case 'paid':
        return { label: 'Payment Confirmed', color: 'green', description: 'Payment received, preparing for fulfillment' };
      case 'processing':
        return { label: 'Processing', color: 'blue', description: 'Order sent to Printful for production' };
      case 'shipped':
        return { label: 'Shipped', color: 'purple', description: 'Your stickers are on the way!' };
      case 'failed':
        return { label: 'Payment Failed', color: 'red', description: 'Payment was not successful' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'gray', description: 'Order was cancelled' };
      default:
        return { label: status, color: 'gray', description: '' };
    }
  };

  useEffect(() => {
    console.log('useShop: Loading products on mount');
    loadProducts();
  }, []);

  useEffect(() => {
    console.log('useShop: User changed:', user?.id);
    if (user) {
      loadCartItems();
      loadOrders();
    } else {
      setCartItems([]);
      setOrders([]);
    }
  }, [user]);

  // Debug useEffect to log cart items changes
  useEffect(() => {
    console.log('Cart items state updated:', cartItems);
  }, [cartItems]);

  return {
    products,
    cartItems,
    orders,
    isLoading,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    createCheckoutSession,
    loadProducts,
    loadCartItems,
    loadOrders,
    getOrderStatusInfo,
  };
};
