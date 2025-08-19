-- Add unique constraints for item QR links
CREATE UNIQUE INDEX IF NOT EXISTS ux_item_qr_links_user_qr
ON public.item_qr_links (user_id, qr_key);

CREATE UNIQUE INDEX IF NOT EXISTS ux_item_qr_links_user_item  
ON public.item_qr_links (user_id, item_id);

-- Atomic function to create item and claim QR in one transaction
CREATE OR REPLACE FUNCTION public.create_item_and_claim_qr(
  p_qr_key text,
  p_name text,
  p_category text default null,
  p_notes text default null,
  p_photo_url text default null,
  p_room text default null,
  p_description text default null,
  p_icon_id text default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item_id uuid;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create the item
  INSERT INTO public.items (
    id, user_id, name, category, notes, photo_url, room, description, icon_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id, p_name, p_category, p_notes, p_photo_url, p_room, p_description, p_icon_id, now(), now()
  ) RETURNING id INTO v_item_id;

  -- Ensure QR key exists in catalog (create if needed for backward compatibility)
  INSERT INTO public.qr_catalog (qr_key, is_active) 
  VALUES (p_qr_key, true)
  ON CONFLICT (qr_key) DO NOTHING;

  -- Claim the QR for this item (atomic upsert)
  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user_id, p_qr_key, v_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET 
    item_id = EXCLUDED.item_id,
    assigned_at = EXCLUDED.assigned_at;

  RETURN v_item_id;
END;
$$;

-- Update existing claim function to ensure it works properly  
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