-- Fix QR code assignment bug by implementing canonical QR keys

-- 1. Add canonical key column to qr_codes table
ALTER TABLE public.qr_codes 
ADD COLUMN qr_key_canonical TEXT;

-- 2. Backfill existing rows with normalized canonical keys
UPDATE public.qr_codes 
SET qr_key_canonical = upper(regexp_replace(code, '[^A-Za-z0-9]', '', 'g'))
WHERE qr_key_canonical IS NULL;

-- 3. Make qr_key_canonical NOT NULL and add unique constraint
ALTER TABLE public.qr_codes 
ALTER COLUMN qr_key_canonical SET NOT NULL;

CREATE UNIQUE INDEX ux_qr_codes_canonical 
ON public.qr_codes (qr_key_canonical);

-- 4. Create trigger function for automatic normalization
CREATE OR REPLACE FUNCTION public.set_qr_canonical()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.qr_key_canonical := upper(regexp_replace(NEW.code, '[^A-Za-z0-9]', '', 'g'));
  RETURN NEW;
END;
$$;

-- 5. Add trigger to qr_codes table
DROP TRIGGER IF EXISTS trg_qr_codes_canonical ON public.qr_codes;
CREATE TRIGGER trg_qr_codes_canonical
  BEFORE INSERT OR UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_qr_canonical();

-- 6. Normalize existing item_qr_links.qr_key values
UPDATE public.item_qr_links 
SET qr_key = upper(regexp_replace(qr_key, '[^A-Za-z0-9]', '', 'g'));

-- 7. Update RPC functions to use canonical keys

-- Update check_qr_assignment function
CREATE OR REPLACE FUNCTION public.check_qr_assignment(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
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

  SELECT i.id, i.name, i.user_id
  INTO v_item
  FROM public.item_qr_links l
  JOIN public.items i ON i.id = l.item_id
  WHERE l.user_id = v_user
    AND l.qr_key = v_qr_key_canon
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
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', true,
      'qr_key', v_qr_key_canon
    );
  END IF;
END;
$$;

-- Update claim_qr_for_item function
CREATE OR REPLACE FUNCTION public.claim_qr_for_item(p_qr_key text, p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_assigned_at timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user, v_qr_key_canon, p_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET item_id = excluded.item_id, assigned_at = now()
  RETURNING assigned_at INTO v_assigned_at;

  RETURN jsonb_build_object(
    'success', true,
    'qr_key', v_qr_key_canon,
    'item_id', p_item_id,
    'assigned_at', v_assigned_at
  );
END;
$$;

-- Update create_item_and_claim_qr function
CREATE OR REPLACE FUNCTION public.create_item_and_claim_qr(
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
  v_item_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.items (id, user_id, name, category, notes, photo_url, room, description, icon_id, created_at)
  VALUES (gen_random_uuid(), v_user, p_name, p_category, p_notes, p_photo_url, p_room, p_description, p_icon_id, now())
  RETURNING id INTO v_item_id;

  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user, v_qr_key_canon, v_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET item_id = excluded.item_id, assigned_at = now();

  RETURN v_item_id;
END;
$$;

-- Update unassign_qr function
CREATE OR REPLACE FUNCTION public.unassign_qr(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr_key_canon text := upper(regexp_replace(coalesce(p_qr_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_count int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.item_qr_links
  WHERE user_id = v_user
    AND qr_key = v_qr_key_canon;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', v_count > 0
  );
END;
$$;