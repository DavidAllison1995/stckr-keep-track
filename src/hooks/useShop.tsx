
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

  // Load cart items
  const loadCartItems = async () => {
    if (!user) {
      console.log('No user, skipping cart load');
      return;
    }

    try {
      console.log('Loading cart items for user:', user.id);
      
      // First check if there are any cart items for this user
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error loading basic cart items:', cartError);
        throw cartError;
      }

      console.log('Basic cart items:', cartData);

      // Now load with product details
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart with products:', error);
        throw error;
      }
      
      console.log('Cart items with products loaded:', data);
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

  // Add to cart
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
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      
      if (existingItem) {
        console.log('Updating existing cart item:', existingItem.id);
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating cart item:', error);
          throw error;
        }
      } else {
        console.log('Inserting new cart item');
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) {
          console.error('Error inserting cart item:', error);
          throw error;
        }
      }

      await loadCartItems();
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

  // Update cart quantity
  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      console.log('Updating cart quantity:', { cartItemId, quantity });
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating cart quantity:', error);
        throw error;
      }
      await loadCartItems();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive',
      });
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      console.log('Removing from cart:', cartItemId);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }
      await loadCartItems();
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
  };
};
