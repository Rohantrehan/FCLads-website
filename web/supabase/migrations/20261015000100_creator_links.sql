-- Now that creators live in the database (not Sanity), link accounts and reviews to them.
-- Deleting a creator with reviews is blocked; deleting one linked to an account unlinks the account.

alter table public.profiles
  add constraint profiles_creator_slug_fkey foreign key (creator_slug)
  references public.creators (slug) on update cascade on delete set null;

alter table public.review_slots
  add constraint review_slots_creator_slug_fkey foreign key (creator_slug)
  references public.creators (slug) on update cascade;

alter table public.review_bookings
  add constraint review_bookings_creator_slug_fkey foreign key (creator_slug)
  references public.creators (slug) on update cascade;

create index if not exists review_slots_creator_idx on public.review_slots (creator_slug);
create index if not exists review_bookings_creator_idx on public.review_bookings (creator_slug);

comment on column public.profiles.creator_slug is 'Creator profile (public.creators) this account posts as. Set by an admin on the posting board (Team).';
