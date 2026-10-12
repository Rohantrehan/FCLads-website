-- Profiles (one per account) and FC Lads+ memberships.
-- Memberships are written only by the server (Stripe webhooks, service role). Users can read their own row.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 3 and 24),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public-facing account details, one row per auth user.';

create table public.memberships (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (
    status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')
  ),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- The 14-day free trial is once per account.
  trial_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.memberships is 'FC Lads+ subscription state, mirrored from Stripe by the webhook.';

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Only the display name is editable by the user.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "Users can read their own membership"
  on public.memberships for select to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.memberships from anon, authenticated;

-- Create the profile when someone signs up. The display name comes from the sign-up form.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 24);
begin
  if char_length(name) < 3 then
    name := left(split_part(new.email, '@', 1), 24);
  end if;
  if char_length(name) < 3 then
    name := 'Lad';
  end if;
  insert into public.profiles (id, display_name) values (new.id, name);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger memberships_touch_updated_at
  before update on public.memberships
  for each row execute function public.touch_updated_at();
