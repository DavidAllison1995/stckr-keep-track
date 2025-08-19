-- A) Make codes canonical (UPPER) end-to-end

-- Add unique index for uppercase codes in qr_codes table
CREATE UNIQUE INDEX IF NOT EXISTS ux_qr_codes_upper 
ON public.qr_codes (upper(code));

-- Create function to force UPPER case on qr_key
CREATE OR REPLACE FUNCTION public.set_qr_upper()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  IF NEW.qr_key IS NOT NULL THEN
    NEW.qr_key := upper(NEW.qr_key);
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to item_qr_links for uppercase normalization
DROP TRIGGER IF EXISTS trg_item_qr_links_upper ON public.item_qr_links;
CREATE TRIGGER trg_item_qr_links_upper
  BEFORE INSERT OR UPDATE ON public.item_qr_links
  FOR EACH ROW EXECUTE PROCEDURE public.set_qr_upper();

-- B) Ensure indices & uniqueness for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS ux_item_qr_links_user_qr
  ON public.item_qr_links (user_id, qr_key);

CREATE UNIQUE INDEX IF NOT EXISTS ux_item_qr_links_user_item
  ON public.item_qr_links (user_id, item_id);

-- Update check_qr_assignment to use canonical model
CREATE OR REPLACE FUNCTION public.check_qr_assignment(p_qr_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_link_record RECORD;
  v_item_record RECORD;
  v_normalized_key text;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', false
    );
  END IF;

  -- Normalize to uppercase
  v_normalized_key := upper(p_qr_key);

  -- Look for existing assignment
  SELECT * INTO v_link_record
  FROM public.item_qr_links
  WHERE user_id = v_user_id AND qr_key = v_normalized_key;

  IF v_link_record IS NULL THEN
    -- Not assigned
    RETURN jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', true,
      'qr_key', v_normalized_key
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
      'qr_key', v_normalized_key
    );
  END IF;

  -- Return assigned item info
  RETURN jsonb_build_object(
    'success', true,
    'assigned', true,
    'authenticated', true,
    'qr_key', v_normalized_key,
    'item', jsonb_build_object(
      'id', v_item_record.id,
      'name', v_item_record.name,
      'user_id', v_item_record.user_id
    )
  );
END;
$function$;

-- Update claim_qr_for_item to use canonical model with uppercase
CREATE OR REPLACE FUNCTION public.claim_qr_for_item(p_qr_key text, p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_item_owner uuid;
  v_normalized_key text;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Normalize to uppercase
  v_normalized_key := upper(p_qr_key);

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
  VALUES (v_normalized_key, true)
  ON CONFLICT (qr_key) DO NOTHING;

  -- Upsert the QR assignment (idempotent)
  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user_id, v_normalized_key, p_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET 
    item_id = EXCLUDED.item_id,
    assigned_at = EXCLUDED.assigned_at;

  RETURN jsonb_build_object(
    'success', true,
    'qr_key', v_normalized_key,
    'item_id', p_item_id,
    'assigned_at', now()
  );
END;
$function$;

-- Update create_item_and_claim_qr to handle all parameters and use uppercase
CREATE OR REPLACE FUNCTION public.create_item_and_claim_qr(
  p_qr_key text, 
  p_name text, 
  p_category text DEFAULT NULL::text, 
  p_notes text DEFAULT NULL::text, 
  p_photo_url text DEFAULT NULL::text, 
  p_room text DEFAULT NULL::text, 
  p_description text DEFAULT NULL::text, 
  p_icon_id text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_item_id uuid;
  v_normalized_key text;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Normalize to uppercase
  v_normalized_key := upper(p_qr_key);

  -- Create the item
  INSERT INTO public.items (
    id, user_id, name, category, notes, photo_url, room, description, icon_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id, p_name, p_category, p_notes, p_photo_url, p_room, p_description, p_icon_id, now(), now()
  ) RETURNING id INTO v_item_id;

  -- Ensure QR key exists in catalog (create if needed for backward compatibility)
  INSERT INTO public.qr_catalog (qr_key, is_active) 
  VALUES (v_normalized_key, true)
  ON CONFLICT (qr_key) DO NOTHING;

  -- Claim the QR for this item (atomic upsert)
  INSERT INTO public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  VALUES (v_user_id, v_normalized_key, v_item_id, now())
  ON CONFLICT (user_id, qr_key)
  DO UPDATE SET 
    item_id = EXCLUDED.item_id,
    assigned_at = EXCLUDED.assigned_at;

  RETURN v_item_id;
END;
$function$;