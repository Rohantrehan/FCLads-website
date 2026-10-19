-- Any Lad can handle any review (creators and admins have the same access since 20261016000000).
-- If the Lad a member asked for isn't around, another one can pick the match up, take over one that's
-- in progress, or send it, and it's credited to whoever does it (creator_slug). requested_slug keeps who
-- the member asked for, so the posting board can show "asked for Stefan, reviewed by Hobs".
-- Same functions and arguments as 20261015000200_review_requests.sql; only who may act changed.

-- Pick up a waiting request, or take over one another Lad started.
create or replace function public.start_review(p_id uuid, p_creator_slug text default null)
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
    where id = p_id and status in ('waiting', 'in_review');
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- Put it back in the queue (for the Lad the member asked for, or any Lad).
create or replace function public.release_review(p_id uuid, p_creator_slug text default null)
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
    where id = p_id and status = 'in_review';
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- The link doesn't work: ask the member for a new one. It comes back to the Lad who asked.
create or replace function public.ask_for_new_link(p_id uuid, p_note text, p_creator_slug text default null)
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
    where id = p_id and status in ('waiting', 'in_review');
  if not found then raise exception 'not_available'; end if;
end;
$$;

-- Send the review, credited to whoever sends it.
create or replace function public.complete_review(
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
    where id = p_id and status in ('waiting', 'in_review');
  if not found then raise exception 'not_available'; end if;
end;
$$;
