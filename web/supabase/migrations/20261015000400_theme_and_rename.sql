-- Site colour and "rename the game everywhere" (posting board → Site settings). Admins only.

alter table public.site_settings
  add column theme_color text not null default '#2bd98b' check (theme_color ~ '^#[0-9a-f]{6}$');

comment on column public.site_settings.theme_color is 'Main site colour (hex). The site works out the lighter and darker shades from it.';

-- Replaces one game name with another (e.g. "FC 27" → "FC 28") in every piece of site content and sets
-- it as the current season. Returns how many rows changed. Names are short and plain (letters, numbers,
-- spaces, . + -), so replacing inside JSON text can't break the JSON.
create function public.rename_game(p_from text, p_to text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed integer := 0;
  v_rows integer;
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_from !~ '^[A-Za-z0-9 .+-]{2,20}$' or p_to !~ '^[A-Za-z0-9 .+-]{2,20}$' or p_from = p_to then
    raise exception 'bad_name';
  end if;

  update public.guides set
    title = replace(title, p_from, p_to),
    excerpt = replace(excerpt, p_from, p_to),
    highlight = replace(highlight, p_from, p_to),
    intro = array(select replace(item, p_from, p_to) from unnest(intro) item),
    body = replace(body::text, p_from, p_to)::jsonb
  where position(p_from in concat_ws(' ', title, excerpt, highlight, array_to_string(intro, ' '), body::text)) > 0;
  get diagnostics v_rows = row_count; v_changed := v_changed + v_rows;

  update public.collections set
    title = replace(title, p_from, p_to),
    description = replace(description, p_from, p_to),
    season = replace(season, p_from, p_to),
    episodes = replace(episodes::text, p_from, p_to)::jsonb
  where position(p_from in concat_ws(' ', title, description, season, episodes::text)) > 0;
  get diagnostics v_rows = row_count; v_changed := v_changed + v_rows;

  update public.feed_posts set fields = replace(fields::text, p_from, p_to)::jsonb
  where position(p_from in fields::text) > 0;
  get diagnostics v_rows = row_count; v_changed := v_changed + v_rows;

  update public.trading_posts set
    title = replace(title, p_from, p_to),
    text = replace(text, p_from, p_to)
  where position(p_from in concat_ws(' ', title, text)) > 0;
  get diagnostics v_rows = row_count; v_changed := v_changed + v_rows;

  update public.creators set
    bio = replace(bio, p_from, p_to),
    tagline = replace(tagline, p_from, p_to),
    role = replace(role, p_from, p_to)
  where position(p_from in concat_ws(' ', bio, tagline, role)) > 0;
  get diagnostics v_rows = row_count; v_changed := v_changed + v_rows;

  update public.site_settings set
    current_season = case when current_season = p_from then p_to else replace(current_season, p_from, p_to) end,
    trending = replace(trending::text, p_from, p_to)::jsonb
  where id = 1;

  return v_changed;
end;
$$;

revoke execute on function public.rename_game(text, text) from public, anon;
grant execute on function public.rename_game(text, text) to authenticated;
