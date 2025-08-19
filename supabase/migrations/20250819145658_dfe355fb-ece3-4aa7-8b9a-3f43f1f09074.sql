-- ============================================================
-- CANONICAL DATA MODEL + POLICIES
-- ============================================================

-- (Optional) Registry of printed codes (use if you pre-generate)
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Per-user mapping from QR key -> item
create table if not exists public.item_qr_links (
  user_id uuid not null,
  qr_key text not null,
  item_id uuid not null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, qr_key)
);

-- (Assumes public.items exists with id uuid pk and user_id uuid)
-- If your items table is in another schema, adjust joins below.

-- Indices + constraints for idempotency/fast lookups
create unique index if not exists ux_item_qr_links_user_qr
  on public.item_qr_links (user_id, qr_key);

create unique index if not exists ux_item_qr_links_user_item
  on public.item_qr_links (user_id, item_id);

-- ============================================================
-- CANONICALIZE QR KEYS (UPPERCASE)
-- ============================================================

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

drop trigger if exists trg_item_qr_links_upper on public.item_qr_links;
create trigger trg_item_qr_links_upper
before insert or update on public.item_qr_links
for each row
execute procedure public.set_qr_upper();

-- Optional: enforce UPPER uniqueness in qr_codes too
create unique index if not exists ux_qr_codes_upper on public.qr_codes (upper(code));

-- ============================================================
-- RLS
-- ============================================================

alter table public.item_qr_links enable row level security;

-- READ own links
drop policy if exists item_qr_links_select on public.item_qr_links;
create policy item_qr_links_select
on public.item_qr_links
for select
using (user_id = auth.uid());

-- WRITE own links
drop policy if exists item_qr_links_modify on public.item_qr_links;
create policy item_qr_links_modify
on public.item_qr_links
for insert with check (user_id = auth.uid())
using (user_id = auth.uid());

-- UPDATE allowed (to move a code to a different item)
drop policy if exists item_qr_links_update on public.item_qr_links;
create policy item_qr_links_update
on public.item_qr_links
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE allowed (unassign)
drop policy if exists item_qr_links_delete on public.item_qr_links;
create policy item_qr_links_delete
on public.item_qr_links
for delete
using (user_id = auth.uid());

-- ============================================================
-- RPCs (single source of truth)
-- ============================================================

-- Check per-user assignment
create or replace function public.check_qr_assignment(p_qr_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_key text := upper(coalesce(p_qr_key, ''));
  v_item record;
begin
  if v_user is null then
    return jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', false,
      'qr_key', v_key
    );
  end if;

  select i.id, i.name, i.user_id
    into v_item
  from public.item_qr_links l
  join public.items i on i.id = l.item_id
  where l.user_id = v_user
    and l.qr_key = v_key
  limit 1;

  if found then
    return jsonb_build_object(
      'success', true,
      'assigned', true,
      'authenticated', true,
      'qr_key', v_key,
      'item', jsonb_build_object(
        'id', v_item.id,
        'name', v_item.name,
        'user_id', v_item.user_id
      )
    );
  else
    return jsonb_build_object(
      'success', true,
      'assigned', false,
      'authenticated', true,
      'qr_key', v_key
    );
  end if;
end
$$;

-- Assign a QR to an existing item (idempotent)
create or replace function public.claim_qr_for_item(p_qr_key text, p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_key text := upper(coalesce(p_qr_key, ''));
  v_assigned_at timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  values (v_user, v_key, p_item_id, now())
  on conflict (user_id, qr_key)
  do update set item_id = excluded.item_id, assigned_at = now()
  returning assigned_at into v_assigned_at;

  return jsonb_build_object(
    'success', true,
    'qr_key', v_key,
    'item_id', p_item_id,
    'assigned_at', v_assigned_at
  );
end
$$;

-- Create an item and atomically claim the QR
-- Adjust column list below to match your public.items schema
create or replace function public.create_item_and_claim_qr(
  p_qr_key text,
  p_name text,
  p_category text default null,
  p_notes text default null,
  p_photo_url text default null,
  p_room text default null,
  p_description text default null,
  p_icon_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_key text := upper(coalesce(p_qr_key, ''));
  v_item_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.items (id, user_id, name, category, notes, photo_url, room, description, icon_id, created_at)
  values (gen_random_uuid(), v_user, p_name, p_category, p_notes, p_photo_url, p_room, p_description, p_icon_id, now())
  returning id into v_item_id;

  insert into public.item_qr_links (user_id, qr_key, item_id, assigned_at)
  values (v_user, v_key, v_item_id, now())
  on conflict (user_id, qr_key)
  do update set item_id = excluded.item_id, assigned_at = now();

  return v_item_id;
end
$$;

-- Unassign a QR from current user
create or replace function public.unassign_qr(p_qr_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_key text := upper(coalesce(p_qr_key, ''));
  v_count int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.item_qr_links
  where user_id = v_user
    and qr_key = v_key;

  get diagnostics v_count = row_count;

  return jsonb_build_object(
    'success', true,
    'deleted', v_count > 0
  );
end
$$;