import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
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
  customer_name?: string;
  shipping_phone?: string;
  printful_order_id?: string;
  printful_status?: string;
  printful_error?: string;
  retry_count?: number;
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

  // Create checkout session with improved error handling
  const createCheckoutSession = async () => {
    if (!user) {
      console.log('Cannot create checkout session: no user');
      toast({
        title: 'Error',
        description: 'Please log in to checkout',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('Creating checkout session for user:', user.id, user.email);
      
      // Get cart items from database to ensure consistency
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (*)
        `)
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error loading cart for checkout:', cartError);
        throw cartError;
      }

      if (!cartItems || cartItems.length === 0) {
        console.log('Cannot create checkout session: empty cart');
        toast({
          title: 'Error',
          description: 'Your cart is empty',
          variant: 'destructive',
        });
        return null;
      }

      console.log('Creating checkout with cart items:', cartItems);
      
      // Get current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError);
        toast({
          title: 'Error',
          description: 'Please try logging in again',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
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
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user orders with enhanced data
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

  // Get comprehensive order status info
  const getOrderStatusInfo = (order: Order) => {
    const { status, printful_status, printful_error } = order;
    
    if (printful_error) {
      return {
        label: 'Fulfillment Error',
        color: 'red',
        description: printful_error,
      };
    }
    
    if (printful_status === 'created' || printful_status === 'pending') {
      return {
        label: 'Processing',
        color: 'blue',
        description: 'Order sent to Printful for production',
      };
    }
    
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Payment',
          color: 'yellow',
          description: 'Waiting for payment confirmation',
        };
      case 'paid':
        return {
          label: 'Payment Confirmed',
          color: 'green',
          description: 'Payment received, preparing for fulfillment',
        };
      case 'processing':
        return {
          label: 'Processing',
          color: 'blue',
          description: 'Order is being prepared',
        };
      case 'shipped':
        return {
          label: 'Shipped',
          color: 'purple',
          description: 'Your order is on the way!',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'green',
          description: 'Order has been delivered',
        };
      case 'failed':
        return {
          label: 'Payment Failed',
          color: 'red',
          description: 'Payment was not successful',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'gray',
          description: 'Order was cancelled',
        };
      default:
        return {
          label: status,
          color: 'gray',
          description: '',
        };
    }
  };

  useEffect(() => {
    console.log('useShop: Loading products on mount');
    loadProducts();
  }, []);

  useEffect(() => {
    console.log('useShop: User changed:', user?.id);
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  return {
    products,
    orders,
    isLoading,
    createCheckoutSession,
    loadProducts,
    loadOrders,
    getOrderStatusInfo,
  };
};
