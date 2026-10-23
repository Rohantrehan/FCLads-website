-- Payments moved from Stripe (never connected) to Dodo Payments. The provider ids get neutral names;
-- the webhook (/payments) and the checkout return keep this table in step with Dodo.

alter table public.memberships rename column stripe_customer_id to customer_id;
alter table public.memberships rename column stripe_subscription_id to subscription_id;

alter table public.memberships rename constraint memberships_stripe_customer_id_key to memberships_customer_id_key;
alter table public.memberships rename constraint memberships_stripe_subscription_id_key to memberships_subscription_id_key;

comment on table public.memberships is 'FC Lads+ subscription state, mirrored from Dodo Payments by the webhook and the checkout return.';
