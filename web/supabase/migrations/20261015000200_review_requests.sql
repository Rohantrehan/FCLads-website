-- Gameplay reviews without time slots. Replaces review_slots + review_bookings (removed in the next
-- migration; they only held cancelled test bookings). A member sends a match any time; a Lad picks it
-- up when they're free and sends back a written review, an optional video and a 3-point plan.
--
-- Rules (enforced here, not just in the app):
--   * only FC Lads+ members can send one; one review per UK calendar month; one open request at a time
--   * the member picks a Lad, or "any Lad" (then any creator can pick it up)
--   * the member can edit the link or cancel until a Lad starts; a Lad can ask for a new link
--   * a creator only sees and handles requests for them or for any Lad; admins see everything
-- Every write goes through the security definer functions below; the table has no direct write grants.
--
-- Status: waiting → in_review → done, or waiting → cancelled, or → fix_link (new link needed) → waiting.

create table public.review_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  -- Display name when sent, so creators see who it's for without reading profiles.
  member_name text not null,
  -- The Lad the member asked for; null = any Lad.
  requested_slug text references public.creators (slug) on update cascade on delete set null,
  -- The Lad handling it: the requested one, or whoever picked it up.
  creator_slug text references public.creators (slug) on update cascade,
  -- First day of the UK month it was sent in: one review per member per month.
  review_month date not null,
  status text not null default 'waiting' check (status in ('waiting', 'in_review', 'fix_link', 'done', 'cancelled')),
  match_url text not null check (match_url ~ '^https://' and char_length(match_url) <= 500),
  focus text not null default '' check (char_length(focus) <= 500),
  -- When the Lad needs a new link: what's wrong with it.
  creator_note text check (char_length(creator_note) <= 300),
  -- The review.
  title text check (char_length(title) <= 80),
  notes text check (char_length(notes) <= 4000),
  recording_url text check (recording_url ~ '^https://' and char_length(recording_url) <= 500),
  plan text[] not null default '{}' check (cardinality(plan) <= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz
);

comment on table public.review_requests is 'A member''s monthly gameplay review: their match link, then the Lad''s written review, video and plan.';

create unique index review_requests_one_per_month
  on public.review_requests (member_id, review_month) where status <> 'cancelled';
create unique index review_requests_one_open
  on public.review_requests (member_id) where status in ('waiting', 'in_review', 'fix_link');
create index review_requests_member on public.review_requests (member_id, created_at desc);
create index review_requests_queue on public.review_requests (creator_slug, status, created_at);

create trigger review_requests_touch_updated_at
  before update on public.review_requests
  for each row execute function public.touch_updated_at();

alter table public.review_requests enable row level security;
revoke insert, update, delete on public.review_requests from anon, authenticated;

create policy "Members see theirs; creators see theirs and any-Lad requests; admins see all"
  on public.review_requests for select to authenticated
  using (
    member_id = (select auth.uid())
    or creator_slug = (select public.my_creator_slug())
    or (creator_slug is null and (select public.is_staff()))
    or (select public.is_admin())
  );

-- ---------- Member functions ----------

create function public.submit_review(p_creator_slug text, p_match_url text, p_focus text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  v_month date := date_trunc('month', now() at time zone 'Europe/London')::date;
  v_name text;
  v_id uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if not public.is_member() then raise exception 'not_member'; end if;
  if p_match_url is null or p_match_url !~ '^https://[^\s]+$' or char_length(p_match_url) > 500 then
    raise exception 'bad_match_url';
  end if;
  if char_length(coalesce(p_focus, '')) > 500 then raise exception 'focus_too_long'; end if;
  if p_creator_slug is not null and not exists (
    select 1 from public.creators where slug = p_creator_slug and not hidden and review_specialty is not null
  ) then
    raise exception 'bad_creator';
  end if;
  if exists (
    select 1 from public.review_requests where member_id = uid and status in ('waiting', 'in_review', 'fix_link')
  ) then
    raise exception 'already_open';
  end if;
  if exists (
    select 1 from public.review_requests where member_id = uid and review_month = v_month and status <> 'cancelled'
  ) then
    raise exception 'month_used';
  end if;

  select display_name into v_name from public.profiles where id = uid;
  insert into public.review_requests (member_id, member_name, requested_slug, creator_slug, review_month, match_url, focus)
  values (uid, coalesce(v_name, 'Member'), p_creator_slug, p_creator_slug, v_month, p_match_url, coalesce(p_focus, ''))
  returning id into v_id;
  return v_id;
end;
$$;

-- Change the link or note before a Lad starts (or after they asked for a new link).
create function public.edit_review(p_id uuid, p_match_url text, p_focus text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_match_url is null or p_match_url !~ '^https://[^\s]+$' or char_length(p_match_url) > 500 then
    raise exception 'bad_match_url';
  end if;
  if char_length(coalesce(p_focus, '')) > 500 then raise exception 'focus_too_long'; end if;
  update public.review_requests
    set match_url = p_match_url, focus = coalesce(p_focus, ''), status = 'waiting', creator_note = null
    where id = p_id and member_id = (select auth.uid()) and status in ('waiting', 'fix_link');
  if not found then raise exception 'already_started'; end if;
end;
$$;

-- Cancel before a Lad starts; gives the month's review back.
create function public.withdraw_review(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.review_requests
    set status = 'cancelled', cancelled_at = now()
    where id = p_id and member_id = (select auth.uid()) and status in ('waiting', 'fix_link');
  if not found then raise exception 'already_started'; end if;
end;
$$;

-- ---------- Creator functions (acting_creator: own slug, or the one an admin passes) ----------

-- Pick up a request: one for you, or one for any Lad.
create function public.start_review(p_id uuid, p_creator_slug text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me text := public.acting_creator(p_creator_slug);
begin
  update public.review_requests
    set status = 'in_review', creator_slug = me, started_at = now()
    where id = p_id and status = 'waiting' and (creator_slug is null or creator_slug = me);
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- Put it back in the queue (for the Lad the member asked for, or any Lad).
create function public.release_review(p_id uuid, p_creator_slug text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me text := public.acting_creator(p_creator_slug);
begin
  update public.review_requests
    set status = 'waiting', creator_slug = requested_slug, started_at = null
    where id = p_id and status = 'in_review' and creator_slug = me;
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- The link doesn't work: ask the member for a new one. The request stays with this Lad.
create function public.ask_for_new_link(p_id uuid, p_note text, p_creator_slug text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me text := public.acting_creator(p_creator_slug);
begin
  if char_length(trim(coalesce(p_note, ''))) = 0 then raise exception 'note_required'; end if;
  if char_length(p_note) > 300 then raise exception 'note_too_long'; end if;
  update public.review_requests
    set status = 'fix_link', creator_slug = me, creator_note = trim(p_note), started_at = null
    where id = p_id and status in ('waiting', 'in_review') and (creator_slug is null or creator_slug = me);
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- Send the review: written notes and/or a video, plus a 1–3 point plan.
create function public.complete_review(
  p_id uuid,
  p_title text,
  p_notes text,
  p_recording_url text,
  p_plan text[],
  p_creator_slug text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me text := public.acting_creator(p_creator_slug);
  v_plan text[] := array(select trim(item) from unnest(coalesce(p_plan, '{}')) item where trim(item) <> '');
  v_recording text := nullif(trim(coalesce(p_recording_url, '')), '');
  v_notes text := nullif(trim(coalesce(p_notes, '')), '');
begin
  if cardinality(v_plan) = 0 then raise exception 'plan_required'; end if;
  if cardinality(v_plan) > 3 then raise exception 'plan_too_long'; end if;
  if exists (select 1 from unnest(v_plan) item where char_length(item) > 300) then raise exception 'plan_item_too_long'; end if;
  if v_recording is not null and (v_recording !~ '^https://[^\s]+$' or char_length(v_recording) > 500) then
    raise exception 'bad_recording_url';
  end if;
  if v_notes is not null and char_length(v_notes) > 4000 then raise exception 'notes_too_long'; end if;
  if char_length(coalesce(p_title, '')) > 80 then raise exception 'title_too_long'; end if;

  update public.review_requests
    set status = 'done', creator_slug = me, title = nullif(trim(coalesce(p_title, '')), ''), notes = v_notes,
        recording_url = v_recording, plan = v_plan, completed_at = now(), started_at = coalesce(started_at, now())
    where id = p_id and status in ('waiting', 'in_review') and (creator_slug is null or creator_slug = me);
  if not found then raise exception 'not_available'; end if;
end;
$$;

revoke execute on function
  public.submit_review(text, text, text),
  public.edit_review(uuid, text, text),
  public.withdraw_review(uuid),
  public.start_review(uuid, text),
  public.release_review(uuid, text),
  public.ask_for_new_link(uuid, text, text),
  public.complete_review(uuid, text, text, text, text[], text)
from public, anon;

grant execute on function
  public.submit_review(text, text, text),
  public.edit_review(uuid, text, text),
  public.withdraw_review(uuid),
  public.start_review(uuid, text),
  public.release_review(uuid, text),
  public.ask_for_new_link(uuid, text, text),
  public.complete_review(uuid, text, text, text, text[], text)
to authenticated;
