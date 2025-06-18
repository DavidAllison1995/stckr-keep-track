
-- Check what's missing and create only what doesn't exist

-- First, let's try to enable RLS if not already enabled (this won't error if already enabled)
DO $$ 
BEGIN
    -- Enable RLS on items table if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'items' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on maintenance_tasks table if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'maintenance_tasks' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$ 
BEGIN
    -- Items table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users can view their own items') THEN
        CREATE POLICY "Users can view their own items" ON public.items FOR SELECT USING (auth.uid() = user_id);
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
    
    -- Maintenance tasks policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maintenance_tasks' AND policyname = 'Users can view their own maintenance tasks') THEN
        CREATE POLICY "Users can view their own maintenance tasks" ON public.maintenance_tasks FOR SELECT USING (auth.uid() = user_id);
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

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
SELECT 'item-documents', 'item-documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'item-documents');

-- Create storage policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own documents') THEN
        CREATE POLICY "Users can upload their own documents" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (bucket_id = 'item-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view their own documents') THEN
        CREATE POLICY "Users can view their own documents" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'item-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" 
        ON storage.objects 
        FOR UPDATE 
        USING (bucket_id = 'item-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own documents') THEN
        CREATE POLICY "Users can delete their own documents" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'item-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;
