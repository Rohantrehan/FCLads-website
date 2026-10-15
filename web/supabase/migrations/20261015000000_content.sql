-- Site content (replaces Sanity): creators, guides, video collections, feed posts, trading posts,
-- site settings, plus an image bucket. Edited on the hidden posting board in the website.
--
-- Who can do what (enforced here, not just in the app):
--   * visitors and members: no direct access at all. The website reads content on the server with the
--     secret key and decides per viewer what to send (lib/*Access.ts), so FC Lads+ text can't be
--     fetched from the browser with the public key.
--   * creators: read and write only their own guides, feed posts and trading posts
--   * admins: everything, including creators, collections, settings and the team (roles)
-- A post is live when status = 'published' and its date has passed (a future date = scheduled).

-- ---------- Roles ----------

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('creator', 'admin'));
$$;

revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- ---------- Tables ----------

create table public.creators (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  hidden boolean not null default false,
  sort_order integer not null default 100,
  name text not null check (char_length(name) between 1 and 60),
  initials text not null check (char_length(initials) between 1 and 3),
  role text not null default '',
  tagline text not null default '',
  country text not null default '',
  country_code text not null default '',
  ovr integer not null default 80 check (ovr between 1 and 99),
  card_position text not null default '',
  -- { gam, tac, trd, meta }
  ratings jsonb not null default '{"gam": 80, "tac": 80, "trd": 80, "meta": 80}',
  badge text,
  rank_label text,
  -- { label, value }
  highlight jsonb,
  bio text,
  -- { youtube?, x?, instagram?, tiktok?, twitch? }
  socials jsonb not null default '{}',
  -- [{ platform, count }]
  audience jsonb not null default '[]',
  review_specialty text,
  since integer,
  image text,
  updated_at timestamptz not null default now()
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null check (char_length(title) between 1 and 120),
  excerpt text not null default '',
  category text not null,
  format text not null default 'article' check (format in ('article', 'video')),
  minutes integer not null default 5 check (minutes between 1 and 600),
  access text not null default 'plus' check (access in ('free', 'plus')),
  author_slug text not null references public.creators (slug) on update cascade,
  published_at timestamptz not null default now(),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  -- { provider: 'loom' | 'youtube', id } (members only)
  video jsonb,
  image text,
  highlight text,
  patch text,
  preset_code text,
  intro text[] not null default '{}',
  -- Editor blocks: p, section, steps, tip, controls, lock (members-only from here)
  body jsonb not null default '[]',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 100,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '',
  season text,
  video_count integer check (video_count >= 0),
  badge text check (badge in ('start', 'in-order', 'meta', 'archive')),
  path_step integer check (path_step between 1 and 9),
  category text,
  -- [{ title, minutes, guideSlug?, video? }]
  episodes jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  post_type text not null check (post_type in ('video', 'update', 'trading', 'tip', 'poll')),
  topic text not null check (topic in ('gameplay', 'trading', 'updates', 'fut-champs')),
  access text not null default 'free' check (access in ('free', 'plus')),
  author_slug text not null references public.creators (slug) on update cascade,
  posted_at timestamptz not null default now(),
  -- The fields for this post type (title, excerpt, targets, options, ...), checked by the website.
  fields jsonb not null default '{}',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.trading_posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  access text not null default 'free' check (access in ('free', 'plus')),
  author_slug text not null references public.creators (slug) on update cascade,
  posted_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  text text not null default '',
  -- { src, alt }
  image jsonb,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  current_patch text not null default '',
  current_season text not null default '',
  -- [{ title, href, authorSlug, views? }]
  trending jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

create index guides_author_idx on public.guides (author_slug);
create index feed_posts_author_idx on public.feed_posts (author_slug);
create index trading_posts_author_idx on public.trading_posts (author_slug);

create trigger creators_touch before update on public.creators for each row execute function public.touch_updated_at();
create trigger guides_touch before update on public.guides for each row execute function public.touch_updated_at();
create trigger collections_touch before update on public.collections for each row execute function public.touch_updated_at();
create trigger feed_posts_touch before update on public.feed_posts for each row execute function public.touch_updated_at();
create trigger trading_posts_touch before update on public.trading_posts for each row execute function public.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- ---------- Row level security ----------

alter table public.creators enable row level security;
alter table public.guides enable row level security;
alter table public.collections enable row level security;
alter table public.feed_posts enable row level security;
alter table public.trading_posts enable row level security;
alter table public.site_settings enable row level security;

revoke all on public.creators, public.guides, public.collections, public.feed_posts, public.trading_posts, public.site_settings
  from anon, authenticated;
grant select, insert, update, delete on public.creators, public.guides, public.collections, public.feed_posts, public.trading_posts
  to authenticated;
grant select, update on public.site_settings to authenticated;

-- Creators' own posts; admins everything. `with check` stops a creator moving a post to someone else.
create policy "Staff read posts" on public.guides for select to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff add posts" on public.guides for insert to authenticated
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff edit posts" on public.guides for update to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()))
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff delete posts" on public.guides for delete to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));

create policy "Staff read posts" on public.feed_posts for select to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff add posts" on public.feed_posts for insert to authenticated
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff edit posts" on public.feed_posts for update to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()))
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff delete posts" on public.feed_posts for delete to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));

create policy "Staff read posts" on public.trading_posts for select to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff add posts" on public.trading_posts for insert to authenticated
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff edit posts" on public.trading_posts for update to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()))
  with check ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));
create policy "Staff delete posts" on public.trading_posts for delete to authenticated
  using ((select public.is_admin()) or author_slug = (select public.my_creator_slug()));

-- Creators can read the creator list (for names on the board); only admins change it.
create policy "Staff read creators" on public.creators for select to authenticated using ((select public.is_staff()));
create policy "Admins add creators" on public.creators for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit creators" on public.creators for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete creators" on public.creators for delete to authenticated using ((select public.is_admin()));

create policy "Staff read collections" on public.collections for select to authenticated using ((select public.is_staff()));
create policy "Admins add collections" on public.collections for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit collections" on public.collections for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete collections" on public.collections for delete to authenticated using ((select public.is_admin()));

create policy "Staff read settings" on public.site_settings for select to authenticated using ((select public.is_staff()));
create policy "Admins edit settings" on public.site_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- Team (admins give the creator / admin role) ----------

-- Staff accounts and their emails, for the board's Team page. Admins only.
create function public.list_team()
returns table (id uuid, email text, display_name text, role text, creator_slug text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  return query
    select p.id, u.email::text, p.display_name, p.role, p.creator_slug
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role in ('creator', 'admin')
    order by p.role, u.email;
end;
$$;

-- Gives an existing account a role (and, for creators, the creator profile it posts as). Admins only.
-- Admins can't change their own role, so the last admin can't lock everyone out.
create function public.set_team_role(p_email text, p_role text, p_creator_slug text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_role not in ('member', 'creator', 'admin') then
    raise exception 'bad_role';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'no_account';
  end if;
  if v_user = (select auth.uid()) then
    raise exception 'own_role';
  end if;
  if p_creator_slug is not null and not exists (select 1 from public.creators where slug = p_creator_slug) then
    raise exception 'no_creator';
  end if;
  if p_role = 'creator' and p_creator_slug is null then
    raise exception 'creator_needed';
  end if;
  update public.profiles
    set role = p_role,
        creator_slug = case when p_role = 'member' then null else p_creator_slug end
    where id = v_user;
end;
$$;

revoke execute on function public.list_team(), public.set_team_role(text, text, text) from public, anon;
grant execute on function public.list_team(), public.set_team_role(text, text, text) to authenticated;

-- ---------- Images ----------
-- Public bucket: files have random names and are only linked from pages that may show them.
-- No select policy, so nobody can list the files. Staff upload; admins or the uploader delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']);

create policy "Staff upload images" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_staff()));
create policy "Admins or the uploader delete images" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and ((select public.is_admin()) or owner_id = (select auth.uid())::text));
