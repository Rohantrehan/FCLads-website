-- A creator's whole player card as one uploaded picture (designed in a card maker). When set, the site
-- shows it in place of the drawn card (OVR, ratings, name). Uploads live in the public "media" bucket.

alter table public.creators add column card_image text;
