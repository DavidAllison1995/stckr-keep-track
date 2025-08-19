-- Create QR catalog table for shared QR keys
CREATE TABLE IF NOT EXISTS public.qr_catalog (
  qr_key TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create item QR links table for per-user assignments (multi-tenant)
CREATE TABLE IF NOT EXISTS public.item_qr_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  qr_key TEXT NOT NULL REFERENCES public.qr_catalog(qr_key),
  item_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, qr_key), -- User can link a QR key to at most one item
  UNIQUE(user_id, item_id)  -- Item can have at most one QR link per user
);

-- Create QR scans table for analytics
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_key TEXT NOT NULL,
  user_id UUID, -- nullable for unauthenticated scans
  platform TEXT, -- ios/android/web/unknown
  source TEXT,   -- camera/native/web
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.qr_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_qr_links ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_catalog (read-only for regular users)
CREATE POLICY "Anyone can view active QR catalog" 
ON public.qr_catalog 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage QR catalog" 
ON public.qr_catalog 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- RLS Policies for item_qr_links (users can only access their own links)
CREATE POLICY "Users can view their own QR links" 
ON public.item_qr_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR links" 
ON public.item_qr_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR links" 
ON public.item_qr_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR links" 
ON public.item_qr_links 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all QR links" 
ON public.item_qr_links 
FOR SELECT 
USING (is_user_admin(auth.uid()));

-- RLS Policies for qr_scans (anyone can insert, admins can view)
CREATE POLICY "Anyone can create QR scan records" 
ON public.qr_scans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all QR scans" 
ON public.qr_scans 
FOR SELECT 
USING (is_user_admin(auth.uid()));

CREATE POLICY "Users can view their own QR scans" 
ON public.qr_scans 
FOR SELECT 
USING (auth.uid() = user_id);

-- Atomic claim/assign function
CREATE OR REPLACE FUNCTION public.claim_qr_for_item(p_qr_key text, p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item_owner uuid;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Verify the item belongs to the user
  SELECT user_id INTO v_item_owner 
  FROM public.items 
  WHERE id = p_item_id;
  
  IF v_item_owner IS NULL THEN
    RAISE EXCEPTION 'Item not found';
  END IF;
  
  IF v_item_owner != v_user_id THEN
    RAISE EXCEPTION 'Item does not belong to user';
  END IF;

  -- Ensure QR key exists in catalog (create if needed for backward compatibility)
  INSERT INTO public.qr_catalog (qr_key, is_active) 
  VALUES (p_qr_key, true)
  ON CONFLICT (qr_key) DO NOTHING;

  -- Upsert the QR assignment
  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user_id, p_qr_key, p_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET 
    item_id = EXCLUDED.item_id,
    assigned_at = EXCLUDED.assigned_at;

  RETURN jsonb_build_object(
    'success', true,
    'qr_key', p_qr_key,
    'item_id', p_item_id,
    'assigned_at', now()
  );
END;
$$;

-- Unassign QR function
CREATE OR REPLACE FUNCTION public.unassign_qr(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_deleted_count int;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Delete the QR assignment
  DELETE FROM public.item_qr_links
  WHERE user_id = v_user_id AND qr_key = p_qr_key;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', v_deleted_count > 0,
    'qr_key', p_qr_key
  );
END;
$$;

-- Function to check QR assignment for current user
CREATE OR REPLACE FUNCTION public.check_qr_assignment(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_link_record RECORD;
  v_item_record RECORD;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', false
    );
  END IF;

  -- Look for existing assignment
  SELECT * INTO v_link_record
  FROM public.item_qr_links
  WHERE user_id = v_user_id AND qr_key = p_qr_key;

  IF v_link_record IS NULL THEN
    -- Not assigned
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', true,
      'qr_key', p_qr_key
    );
  END IF;

  -- Get item details
  SELECT id, name, user_id INTO v_item_record
  FROM public.items
  WHERE id = v_link_record.item_id;

  IF v_item_record IS NULL THEN
    -- Item was deleted, clean up the link
    DELETE FROM public.item_qr_links WHERE id = v_link_record.id;
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', true,
      'qr_key', p_qr_key
    );
  END IF;

  -- Return assigned item info
  RETURN jsonb_build_object(
    'success', true,
    'assigned', true,
    'authenticated', true,
    'qr_key', p_qr_key,
    'item', jsonb_build_object(
      'id', v_item_record.id,
      'name', v_item_record.name,
      'user_id', v_item_record.user_id
    )
  );
END;
$$;

-- Seed some QR codes for testing (you can expand this)
INSERT INTO public.qr_catalog (qr_key, is_active) VALUES
('QR001', true),
('QR002', true), 
('QR003', true),
('QR004', true),
('QR005', true)
ON CONFLICT (qr_key) DO NOTHING;

-- Migrate existing data if needed
-- Convert existing qr_codes.code to qr_catalog if they don't exist
INSERT INTO public.qr_catalog (qr_key, is_active)
SELECT DISTINCT code, true
FROM public.qr_codes
WHERE code IS NOT NULL
ON CONFLICT (qr_key) DO NOTHING;