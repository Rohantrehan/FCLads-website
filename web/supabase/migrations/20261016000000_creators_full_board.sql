-- Creators get the same posting-board access as admins: every post, guides, video collections,
-- creator profiles, site settings (colour, rename the game) and the team page.
-- is_admin() is what every board policy and admin function checks, so widening it covers them all.
-- Reviews are unchanged in practice: the creator hub still lists each creator's own queue.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('creator', 'admin'));
$$;
