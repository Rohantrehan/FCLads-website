-- Monthly gameplay reviews: creators publish free times (slots), FC Lads+ members book one a month.
--
-- Rules (enforced here, not just in the app):
--   * only FC Lads+ members can book; one review per calendar month (UK time), one upcoming at a time
--   * a slot can only hold one active booking
--   * members can cancel up to 12 hours before; creators mark a review done (recording + plan) or missed
-- Every write goes through the security definer functions below; tables have no direct write grants.

-- ---------- Roles ----------

alter table public.profiles
  add column role text not null default 'member' check (role in ('member', 'creator', 'admin')),
  -- Slug of the creator in the CMS (Sanity) this account belongs to. Set by an admin.
  add column creator_slug text unique check (creator_slug ~ '^[a-z0-9-]+$');

comment on column public.profiles.role is 'member (default), creator (runs reviews) or admin. Set by an admin only.';

-- Signed-in user's role helpers. Security definer so policies can use them without recursion.
create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where user_id = (select auth.uid()) and status in ('trialing', 'active', 'past_due')
  );
$$;

create function public.my_creator_slug()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select creator_slug from public.profiles
  where id = (select auth.uid()) and role in ('creator', 'admin');
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

revoke execute on function public.is_member(), public.my_creator_slug(), public.is_admin() from public, anon;
grant execute on function public.is_member(), public.my_creator_slug(), public.is_admin() to authenticated;

-- ---------- Tables ----------

create table public.review_slots (
  id uuid primary key default gen_random_uuid(),
  creator_slug text not null check (creator_slug ~ '^[a-z0-9-]+$'),
  starts_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 15 and 120),
  -- The active booking on this slot, if any. Cleared when that booking is cancelled.
  booking_id uuid unique,
  created_at timestamptz not null default now(),
  unique (creator_slug, starts_at)
);

comment on table public.review_slots is 'Times a creator is free for a 30-minute gameplay review.';

create table public.review_bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  -- The slot it was booked on. Cleared if a creator later removes that (freed) slot; the booking
  -- keeps its own creator and time below, so history stays readable.
  slot_id uuid references public.review_slots (id) on delete set null,
  creator_slug text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null,
  -- First day of the UK calendar month the session is in: one review per member per month.
  review_month date not null,
  -- Display name at booking time, so creators see who they're meeting without reading profiles.
  member_name text not null,
  status text not null default 'booked' check (status in ('booked', 'completed', 'missed', 'cancelled')),
  match_url text not null check (match_url ~ '^https://' and char_length(match_url) <= 500),
  focus text not null default '' check (char_length(focus) <= 500),
  meeting_url text check (meeting_url ~ '^https://' and char_length(meeting_url) <= 500),
  recording_url text check (recording_url ~ '^https://' and char_length(recording_url) <= 500),
  title text check (char_length(title) <= 80),
  plan text[] not null default '{}' check (cardinality(plan) <= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  completed_at timestamptz
);

comment on table public.review_bookings is 'A member''s booked review session, its outcome and the written plan.';

alter table public.review_slots
  add constraint review_slots_booking_fk foreign key (booking_id) references public.review_bookings (id) on delete set null;

create unique index review_bookings_one_per_month
  on public.review_bookings (member_id, review_month) where status <> 'cancelled';
create index review_bookings_member on public.review_bookings (member_id, starts_at desc);
create index review_bookings_creator on public.review_bookings (creator_slug, starts_at);
create index review_slots_open on public.review_slots (starts_at) where booking_id is null;

create trigger review_bookings_touch_updated_at
  before update on public.review_bookings
  for each row execute function public.touch_updated_at();

-- ---------- Row level security (read only; writes go through the functions) ----------

alter table public.review_slots enable row level security;
alter table public.review_bookings enable row level security;

revoke insert, update, delete on public.review_slots, public.review_bookings from anon, authenticated;

create policy "Members see free future slots; creators see their own; admins see all"
  on public.review_slots for select to authenticated
  using (
    (booking_id is null and starts_at > now() and (select public.is_member()))
    or creator_slug = (select public.my_creator_slug())
    or (select public.is_admin())
  );

create policy "Members see their bookings; creators see bookings with them; admins see all"
  on public.review_bookings for select to authenticated
  using (
    member_id = (select auth.uid())
    or creator_slug = (select public.my_creator_slug())
    or (select public.is_admin())
  );

-- ---------- Member functions ----------

-- Book a free slot. Errors are short codes the site turns into plain messages.
create function public.book_review(p_slot_id uuid, p_match_url text, p_focus text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  slot public.review_slots;
  v_month date;
  booking uuid;
  v_name text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if not public.is_member() then raise exception 'not_member'; end if;
  if p_match_url is null or p_match_url !~ '^https://[^\s]+$' or char_length(p_match_url) > 500 then
    raise exception 'bad_match_url';
  end if;
  if char_length(coalesce(p_focus, '')) > 500 then raise exception 'focus_too_long'; end if;

  select * into slot from public.review_slots where id = p_slot_id for update;
  if not found or slot.booking_id is not null then raise exception 'slot_taken'; end if;
  if slot.starts_at < now() + interval '2 hours' then raise exception 'slot_too_soon'; end if;

  if exists (
    select 1 from public.review_bookings
    where member_id = uid and status = 'booked' and starts_at > now()
  ) then
    raise exception 'already_booked';
  end if;

  v_month := date_trunc('month', slot.starts_at at time zone 'Europe/London')::date;
  if exists (
    select 1 from public.review_bookings
    where member_id = uid and review_month = v_month and status <> 'cancelled'
  ) then
    raise exception 'month_used';
  end if;

  select display_name into v_name from public.profiles where id = uid;

  insert into public.review_bookings
    (member_id, slot_id, creator_slug, starts_at, duration_minutes, review_month, member_name, match_url, focus)
  values
    (uid, slot.id, slot.creator_slug, slot.starts_at, slot.duration_minutes, v_month, coalesce(v_name, 'Member'),
     p_match_url, trim(coalesce(p_focus, '')))
  returning id into booking;

  update public.review_slots set booking_id = booking where id = slot.id;
  return booking;
end;
$$;

-- Cancel an upcoming booking (frees the slot and the month's review). Up to 12 hours before.
create function public.cancel_review(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking public.review_bookings;
begin
  select * into booking from public.review_bookings
  where id = p_booking_id and member_id = (select auth.uid()) for update;
  if not found or booking.status <> 'booked' then raise exception 'not_found'; end if;
  if booking.starts_at < now() + interval '12 hours' then raise exception 'too_late_to_cancel'; end if;

  update public.review_bookings set status = 'cancelled', cancelled_at = now() where id = booking.id;
  update public.review_slots set booking_id = null where id = booking.slot_id and booking_id = booking.id;
end;
$$;

-- ---------- Creator functions ----------

-- Which creator the caller acts as: their own, or (admins) the one they pass.
create function public.acting_creator(p_creator_slug text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  own text := public.my_creator_slug();
begin
  if public.is_admin() and p_creator_slug is not null then return p_creator_slug; end if;
  if own is null then raise exception 'not_creator'; end if;
  return own;
end;
$$;

-- Add free times on one day, in UK time (e.g. 2026-10-20, {18:00,18:30}). Existing times are skipped.
create function public.add_review_slots(p_day date, p_times time[], p_creator_slug text default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  creator text := public.acting_creator(p_creator_slug);
  added integer;
begin
  if p_day is null or cardinality(p_times) = 0 or cardinality(p_times) > 24 then raise exception 'bad_times'; end if;
  if p_day > (now() at time zone 'Europe/London')::date + 90 then raise exception 'too_far_ahead'; end if;

  insert into public.review_slots (creator_slug, starts_at)
  select creator, (p_day + t) at time zone 'Europe/London'
  from unnest(p_times) as t
  where (p_day + t) at time zone 'Europe/London' > now()
  on conflict (creator_slug, starts_at) do nothing;

  get diagnostics added = row_count;
  return added;
end;
$$;

-- Remove a free time. Booked times can't be removed (the member has to cancel, or an admin steps in).
create function public.remove_review_slot(p_slot_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.review_slots
  where id = p_slot_id
    and booking_id is null
    and (creator_slug = public.my_creator_slug() or public.is_admin());
  if not found then raise exception 'not_found'; end if;
end;
$$;

-- Creator updates on a booking they run.
create function public.update_review(
  p_booking_id uuid,
  p_status text,
  p_meeting_url text default null,
  p_recording_url text default null,
  p_title text default null,
  p_plan text[] default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking public.review_bookings;
  clean_plan text[];
begin
  select * into booking from public.review_bookings where id = p_booking_id for update;
  -- coalesce: for non-creators my_creator_slug() is null, and `not (null or false)` would be null (= pass).
  if not found or not coalesce(booking.creator_slug = public.my_creator_slug() or public.is_admin(), false) then
    raise exception 'not_found';
  end if;
  if booking.status = 'cancelled' then raise exception 'cancelled'; end if;
  if p_status not in ('booked', 'completed', 'missed') then raise exception 'bad_status'; end if;
  if p_status <> 'booked' and booking.starts_at > now() then raise exception 'not_started'; end if;

  if p_meeting_url is not null and p_meeting_url <> '' and p_meeting_url !~ '^https://[^\s]+$' then
    raise exception 'bad_meeting_url';
  end if;
  if p_recording_url is not null and p_recording_url <> '' and p_recording_url !~ '^https://[^\s]+$' then
    raise exception 'bad_recording_url';
  end if;

  select coalesce(array_agg(trim(item)) filter (where trim(item) <> ''), '{}') into clean_plan
  from unnest(coalesce(p_plan, '{}')) as item;
  if cardinality(clean_plan) > 3 then raise exception 'plan_too_long'; end if;
  if p_status = 'completed' and cardinality(clean_plan) = 0 then raise exception 'plan_required'; end if;

  update public.review_bookings set
    status = p_status,
    meeting_url = nullif(trim(coalesce(p_meeting_url, booking.meeting_url, '')), ''),
    recording_url = nullif(trim(coalesce(p_recording_url, booking.recording_url, '')), ''),
    title = nullif(trim(coalesce(p_title, booking.title, '')), ''),
    plan = case when p_plan is null then booking.plan else clean_plan end,
    completed_at = case when p_status = 'completed' then coalesce(booking.completed_at, now()) else null end
  where id = booking.id;
end;
$$;

revoke execute on function
  public.book_review(uuid, text, text),
  public.cancel_review(uuid),
  public.acting_creator(text),
  public.add_review_slots(date, time[], text),
  public.remove_review_slot(uuid),
  public.update_review(uuid, text, text, text, text, text[])
from public, anon;

grant execute on function
  public.book_review(uuid, text, text),
  public.cancel_review(uuid),
  public.add_review_slots(date, time[], text),
  public.remove_review_slot(uuid),
  public.update_review(uuid, text, text, text, text, text[])
to authenticated;

-- Supabase grants new functions to `authenticated` by default; this helper is internal only.
revoke execute on function public.acting_creator(text) from authenticated;
