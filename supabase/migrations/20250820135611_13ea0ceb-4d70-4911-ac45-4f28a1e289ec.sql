-- Comprehensive QR System Rewrite Migration
-- This migration completely restructures the QR system for consistency and reliability

-- 1. Update qr_codes table to have single source of truth
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS code_printed TEXT,
ADD COLUMN IF NOT EXISTS claimed_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Migrate existing data
UPDATE public.qr_codes 
SET code_printed = code 
WHERE code_printed IS NULL;

-- Make code_printed required
ALTER TABLE public.qr_codes 
ALTER COLUMN code_printed SET NOT NULL;

-- 2. Add qr_code_id to items table for reverse lookup
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL;

-- 3. Create unique index on canonical key
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_codes_canonical_unique 
ON public.qr_codes(qr_key_canonical);

-- 4. Create trigger to ensure qr_key_canonical is always set correctly
CREATE OR REPLACE FUNCTION public.set_qr_canonical()
RETURNS TRIGGER AS $$
BEGIN
  NEW.qr_key_canonical := upper(regexp_replace(COALESCE(NEW.code, NEW.code_printed, ''), '[^A-Za-z0-9]', '', 'g'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_qr_canonical ON public.qr_codes;
CREATE TRIGGER trigger_set_qr_canonical
  BEFORE INSERT OR UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_qr_canonical();

-- 5. Migrate existing item_qr_links data to qr_codes table
UPDATE public.qr_codes 
SET 
  claimed_item_id = (
    SELECT item_id 
    FROM public.item_qr_links 
    WHERE qr_key = qr_codes.qr_key_canonical 
    LIMIT 1
  ),
  claimed_by_user_id = (
    SELECT user_id 
    FROM public.item_qr_links 
    WHERE qr_key = qr_codes.qr_key_canonical 
    LIMIT 1
  ),
  claimed_at = (
    SELECT assigned_at 
    FROM public.item_qr_links 
    WHERE qr_key = qr_codes.qr_key_canonical 
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 
  FROM public.item_qr_links 
  WHERE qr_key = qr_codes.qr_key_canonical
);

-- Update items table with qr_code_id
UPDATE public.items 
SET qr_code_id = (
  SELECT id 
  FROM public.qr_codes 
  WHERE claimed_item_id = items.id 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM public.qr_codes 
  WHERE claimed_item_id = items.id
);

-- 6. Create new RPCs using canonical keys and single source of truth
CREATE OR REPLACE FUNCTION public.check_qr_assignment_v2(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_qr_record record;
  v_item record;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', false,
      'qr_key', v_qr_key_canon
    );
  END IF;

  -- Get QR code record
  SELECT id, claimed_item_id, claimed_by_user_id
  INTO v_qr_record
  FROM public.qr_codes
  WHERE qr_key_canonical = v_qr_key_canon
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'assigned', false,
      'authenticated', true,
      'qr_key', v_qr_key_canon,
      'error', 'QR code not found'
    );
  END IF;

  -- Check if assigned and user has access
  IF v_qr_record.claimed_item_id IS NOT NULL AND v_qr_record.claimed_by_user_id = v_user THEN
    SELECT id, name, user_id
    INTO v_item
    FROM public.items
    WHERE id = v_qr_record.claimed_item_id
    AND user_id = v_user
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'assigned', true,
        'authenticated', true,
        'qr_key', v_qr_key_canon,
        'item', jsonb_build_object(
          'id', v_item.id,
          'name', v_item.name,
          'user_id', v_item.user_id
        )
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'assigned', false,
    'authenticated', true,
    'qr_key', v_qr_key_canon
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_qr_for_item_v2(p_qr_key text, p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_qr_id uuid;
  v_item_owner uuid;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify item belongs to user
  SELECT user_id INTO v_item_owner
  FROM public.items
  WHERE id = p_item_id;

  IF v_item_owner IS NULL OR v_item_owner <> v_user THEN
    RAISE EXCEPTION 'Item not found or access denied';
  END IF;

  -- Get QR code and ensure it's not already claimed
  SELECT id INTO v_qr_id
  FROM public.qr_codes
  WHERE qr_key_canonical = v_qr_key_canon
  AND claimed_item_id IS NULL
  FOR UPDATE;

  IF v_qr_id IS NULL THEN
    -- Check if QR exists but is claimed
    IF EXISTS (SELECT 1 FROM public.qr_codes WHERE qr_key_canonical = v_qr_key_canon) THEN
      RAISE EXCEPTION 'QR code is already assigned';
    ELSE
      RAISE EXCEPTION 'QR code not found';
    END IF;
  END IF;

  -- Claim the QR code
  UPDATE public.qr_codes
  SET 
    claimed_item_id = p_item_id,
    claimed_by_user_id = v_user,
    claimed_at = v_now
  WHERE id = v_qr_id;

  -- Update item with QR code reference
  UPDATE public.items
  SET qr_code_id = v_qr_id
  WHERE id = p_item_id;

  RETURN jsonb_build_object(
    'success', true,
    'qr_key', v_qr_key_canon,
    'item_id', p_item_id,
    'assigned_at', v_now
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_item_and_claim_qr_v2(
  p_qr_key text,
  p_name text,
  p_category text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_room text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_icon_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_qr_id uuid;
  v_item_id uuid;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get QR code and ensure it's not already claimed
  SELECT id INTO v_qr_id
  FROM public.qr_codes
  WHERE qr_key_canonical = v_qr_key_canon
  AND claimed_item_id IS NULL
  FOR UPDATE;

  IF v_qr_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.qr_codes WHERE qr_key_canonical = v_qr_key_canon) THEN
      RAISE EXCEPTION 'QR code is already assigned';
    ELSE
      RAISE EXCEPTION 'QR code not found';
    END IF;
  END IF;

  -- Create the item
  INSERT INTO public.items (id, user_id, name, category, notes, photo_url, room, description, icon_id, created_at, qr_code_id)
  VALUES (gen_random_uuid(), v_user, p_name, p_category, p_notes, p_photo_url, p_room, p_description, p_icon_id, v_now, v_qr_id)
  RETURNING id INTO v_item_id;

  -- Claim the QR code
  UPDATE public.qr_codes
  SET 
    claimed_item_id = v_item_id,
    claimed_by_user_id = v_user,
    claimed_at = v_now
  WHERE id = v_qr_id;

  RETURN v_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.unassign_qr_v2(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_qr_record record;
  v_count int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get QR code that belongs to user
  SELECT id, claimed_item_id INTO v_qr_record
  FROM public.qr_codes
  WHERE qr_key_canonical = v_qr_key_canon
  AND claimed_by_user_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'deleted', false
    );
  END IF;

  -- Clear QR assignment
  UPDATE public.qr_codes
  SET 
    claimed_item_id = NULL,
    claimed_by_user_id = NULL,
    claimed_at = NULL
  WHERE id = v_qr_record.id;

  -- Clear item QR reference
  IF v_qr_record.claimed_item_id IS NOT NULL THEN
    UPDATE public.items
    SET qr_code_id = NULL
    WHERE id = v_qr_record.claimed_item_id;
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', true
  );
END;
$$;