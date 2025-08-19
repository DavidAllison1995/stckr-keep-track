-- Add case-insensitive triggers and constraints for QR keys

-- Ensure all QR keys are stored as UPPERCASE for consistency
create or replace function public.set_qr_upper()
returns trigger
language plpgsql
as $$
begin
  if new.qr_key is not null then
    new.qr_key := upper(new.qr_key);
  end if;
  return new;
end
$$;

-- Drop existing trigger if it exists and recreate
drop trigger if exists trg_item_qr_links_upper on public.item_qr_links;
create trigger trg_item_qr_links_upper
before insert or update on public.item_qr_links
for each row
execute procedure public.set_qr_upper();

-- Ensure unique constraints for idempotency
create unique index if not exists ux_item_qr_links_user_qr 
  on public.item_qr_links (user_id, qr_key);

create unique index if not exists ux_item_qr_links_user_item 
  on public.item_qr_links (user_id, item_id);