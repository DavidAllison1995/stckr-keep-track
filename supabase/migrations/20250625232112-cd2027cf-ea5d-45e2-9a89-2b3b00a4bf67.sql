
-- Fix 1: Add missing RLS policies for critical tables

-- Cart Items - Users can only access their own cart items
CREATE POLICY "Users can view their own cart items" 
  ON public.cart_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart items" 
  ON public.cart_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
  ON public.cart_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
  ON public.cart_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Fix 2: Add proper RLS policies for notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Fix 3: Add RLS policies for scan_history
CREATE POLICY "Users can view their own scan history" 
  ON public.scan_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scan history" 
  ON public.scan_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Fix 4: Clean up user_settings policies and ensure proper access
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Fix 5: First drop all policies that depend on is_admin function
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Now we can safely drop the duplicate is_admin function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Fix 6: Clean up duplicate and conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;

-- Recreate clean profiles policies using standardized function
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Fix 7: Clean up and recreate policies using standardized admin function
DROP POLICY IF EXISTS "Admins can view all items" ON public.items;
DROP POLICY IF EXISTS "Admins can view all maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all claims" ON public.user_qr_claims;
DROP POLICY IF EXISTS "Admins can manage qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scan_history;

-- Recreate all admin policies with standardized function
CREATE POLICY "Admins can view all items" 
  ON public.items 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all maintenance tasks" 
  ON public.maintenance_tasks 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all orders" 
  ON public.orders 
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all order items" 
  ON public.order_items 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all claims" 
  ON public.user_qr_claims 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage qr_codes" 
  ON public.qr_codes 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all scans" 
  ON public.scan_history 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));
