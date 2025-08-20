-- Canonical QR key system and single source of truth migration
-- 1) Ensure columns exist on qr_codes (idempotent)
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS code_printed text;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS qr_key_canonical text;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS claimed_item_id uuid;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS claimed_by_user_id uuid;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- 2) Make qr_key_canonical always derived from code_printed (preferred) or legacy code
CREATE OR REPLACE FUNCTION public.set_qr_canonical()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.qr_key_canonical := upper(regexp_replace(COALESCE(NEW.code_printed, NEW.code, ''), '[^A-Za-z0-9]', '', 'g'));
  RETURN NEW;
END;
$$;

-- 3) Attach trigger on qr_codes
DROP TRIGGER IF EXISTS trg_set_qr_canonical ON public.qr_codes;
CREATE TRIGGER trg_set_qr_canonical
BEFORE INSERT OR UPDATE ON public.qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.set_qr_canonical();

-- 4) Backfill canonical keys for existing rows
UPDATE public.qr_codes
SET qr_key_canonical = upper(regexp_replace(COALESCE(code_printed, code, ''), '[^A-Za-z0-9]', '', 'g'))
WHERE COALESCE(qr_key_canonical, '') = '';

-- 5) Unique index on canonical key
CREATE UNIQUE INDEX IF NOT EXISTS uq_qr_codes_qr_key_canonical ON public.qr_codes (qr_key_canonical);

-- 6) Add FK from items.qr_code_id to qr_codes.id
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_qr_code_id_fkey;
ALTER TABLE public.items
  ADD CONSTRAINT items_qr_code_id_fkey
  FOREIGN KEY (qr_code_id)
  REFERENCES public.qr_codes (id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;
