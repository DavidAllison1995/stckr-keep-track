-- Create a secure RPC to claim a QR code for a user and item
-- Ensures the code exists, the item belongs to the user, and prevents duplicates
-- Inserts into both user_qr_links and user_qr_claims atomically

CREATE OR REPLACE FUNCTION public.claim_qr(
  p_code text,
  p_user_id uuid,
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_qr_id uuid;
  v_item_owner uuid;
  v_existing_link uuid;
  v_now timestamptz := now();
  v_result jsonb;
BEGIN
  -- Caller must be the same as p_user_id unless caller is admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.is_user_admin(auth.uid()) AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Find QR code id by code
  SELECT id INTO v_qr_id FROM public.qr_codes WHERE code = p_code;
  IF v_qr_id IS NULL THEN
    RAISE EXCEPTION 'qr code not found';
  END IF;

  -- Verify item belongs to user
  SELECT user_id INTO v_item_owner FROM public.items WHERE id = p_item_id;
  IF v_item_owner IS NULL OR v_item_owner <> p_user_id THEN
    RAISE EXCEPTION 'item does not belong to user';
  END IF;

  -- Check if already linked for this user
  SELECT id INTO v_existing_link
  FROM public.user_qr_links
  WHERE user_id = p_user_id AND qr_code_id = v_qr_id;

  IF v_existing_link IS NULL THEN
    INSERT INTO public.user_qr_links (user_id, qr_code_id, item_id, assigned_at)
    VALUES (p_user_id, v_qr_id, p_item_id, v_now);
  ELSE
    -- Update to new item if different
    UPDATE public.user_qr_links
    SET item_id = p_item_id, assigned_at = v_now
    WHERE id = v_existing_link;
  END IF;

  -- Record the claim (idempotent-ish: allow multiple claims history)
  INSERT INTO public.user_qr_claims (qr_code_id, user_id, item_id, claimed_at)
  VALUES (v_qr_id, p_user_id, p_item_id, v_now);

  v_result := jsonb_build_object(
    'success', true,
    'qr_code_id', v_qr_id,
    'item_id', p_item_id,
    'user_id', p_user_id,
    'claimed_at', v_now
  );

  RETURN v_result;
END;
$$;