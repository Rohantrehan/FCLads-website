-- Card pictures, edited on their own posting-board page (Cards): the three fanned cards in the Home
-- hero (front, back left, back right) and the "Elite tier" membership card on the FC Lads+ page. Each
-- is one uploaded picture of the whole card. An empty slot shows the drawn card instead.
-- Replaces creators.card_image (added and dropped the same day, never used).

alter table public.creators drop column if exists card_image;

alter table public.site_settings
  add column cards jsonb not null default $json${"home":[{"image":null,"name":"","href":""},{"image":null,"name":"","href":""},{"image":null,"name":"","href":""}],"plus":null}$json$::jsonb,
  add constraint site_settings_cards_shape check (jsonb_typeof(cards) = 'object' and jsonb_typeof(cards -> 'home') = 'array');
