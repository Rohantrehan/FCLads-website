-- The old slot-based booking (20261014000000_review_bookings.sql), replaced by review_requests.
-- Only cancelled test bookings were in it.

drop table if exists public.review_slots cascade;
drop table if exists public.review_bookings cascade;
drop function if exists public.book_review(uuid, text, text);
drop function if exists public.cancel_review(uuid);
drop function if exists public.add_review_slots(date, time[], text);
drop function if exists public.remove_review_slot(uuid);
drop function if exists public.update_review(uuid, text, text, text, text, text[]);
