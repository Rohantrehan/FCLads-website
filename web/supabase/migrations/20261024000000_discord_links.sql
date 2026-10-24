-- Discord accounts linked to FC Lads accounts, for the FC Lads+ members role in the server.
-- One Discord account per FC Lads account and the other way round. Written only by the server with the
-- secret key (the /discord/callback route, the unlink action and the membership sync); members can read
-- their own row.

create table public.discord_links (
  user_id uuid primary key references auth.users (id) on delete cascade,
  discord_user_id text not null unique,
  discord_username text not null,
  -- True while the members role is on their Discord account (as far as we last set it).
  role_granted boolean not null default false,
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.discord_links enable row level security;

create policy "Members read their own Discord link"
  on public.discord_links for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.discord_links from anon, authenticated;
