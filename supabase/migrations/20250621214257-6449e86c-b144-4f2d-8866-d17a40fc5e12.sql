
-- First, let's add proper RLS policies for all tables that are missing them

-- Items table policies (if not already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users can view their own items') THEN
        CREATE POLICY "Users can view their own items" ON public.items FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Admins can view all items') THEN
        CREATE POLICY "Admins can view all items" ON public.items FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users can create their own items') THEN
        CREATE POLICY "Users can create their own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users can update their own items') THEN
        CREATE POLICY "Users can update their own items" ON public.items FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users can delete their own items') THEN
        CREATE POLICY "Users can delete their own items" ON public.items FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Maintenance tasks policies (if not already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Users can view their own maintenance tasks') THEN
        CREATE POLICY "Users can view their own maintenance tasks" ON public.maintenance_tasks FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Admins can view all maintenance tasks') THEN
        CREATE POLICY "Admins can view all maintenance tasks" ON public.maintenance_tasks FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Users can create their own maintenance tasks') THEN
        CREATE POLICY "Users can create their own maintenance tasks" ON public.maintenance_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Users can update their own maintenance tasks') THEN
        CREATE POLICY "Users can update their own maintenance tasks" ON public.maintenance_tasks FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Users can delete their own maintenance tasks') THEN
        CREATE POLICY "Users can delete their own maintenance tasks" ON public.maintenance_tasks FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Orders table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Users can view their own orders') THEN
        CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Admins can view all orders') THEN
        CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Users can create their own orders') THEN
        CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Admins can update all orders') THEN
        CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_user_admin(auth.uid()));
    END IF;
END $$;

-- QR codes policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'qr_codes' AND policyname = 'Anyone can view qr_codes') THEN
        CREATE POLICY "Anyone can view qr_codes" ON public.qr_codes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'qr_codes' AND policyname = 'Admins can manage qr_codes') THEN
        CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes FOR ALL USING (public.is_user_admin(auth.uid()));
    END IF;
END $$;

-- User QR claims policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_qr_claims' AND policyname = 'Users can view their own claims') THEN
        CREATE POLICY "Users can view their own claims" ON public.user_qr_claims FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_qr_claims' AND policyname = 'Admins can view all claims') THEN
        CREATE POLICY "Admins can view all claims" ON public.user_qr_claims FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_qr_claims' AND policyname = 'Users can create their own claims') THEN
        CREATE POLICY "Users can create their own claims" ON public.user_qr_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_qr_claims' AND policyname = 'Users can update their own claims') THEN
        CREATE POLICY "Users can update their own claims" ON public.user_qr_claims FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_qr_claims' AND policyname = 'Users can delete their own claims') THEN
        CREATE POLICY "Users can delete their own claims" ON public.user_qr_claims FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Products table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Anyone can view products') THEN
        CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Admins can manage products') THEN
        CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_user_admin(auth.uid()));
    END IF;
END $$;

-- Order items policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Users can view their own order items') THEN
        CREATE POLICY "Users can view their own order items" ON public.order_items 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.orders 
                WHERE orders.id = order_items.order_id 
                AND orders.user_id = auth.uid()
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Admins can view all order items') THEN
        CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Users can create order items for their orders') THEN
        CREATE POLICY "Users can create order items for their orders" ON public.order_items 
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders 
                WHERE orders.id = order_items.order_id 
                AND orders.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Scan history policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scan_history' AND policyname = 'Users can view their own scans') THEN
        CREATE POLICY "Users can view their own scans" ON public.scan_history FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scan_history' AND policyname = 'Admins can view all scans') THEN
        CREATE POLICY "Admins can view all scans" ON public.scan_history FOR SELECT USING (public.is_user_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scan_history' AND policyname = 'Users can create their own scans') THEN
        CREATE POLICY "Users can create their own scans" ON public.scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User settings policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can view their own settings') THEN
        CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can create their own settings') THEN
        CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can update their own settings') THEN
        CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS on all tables (if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'items' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'maintenance_tasks' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'qr_codes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_qr_claims' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.user_qr_claims ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'scan_history' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
