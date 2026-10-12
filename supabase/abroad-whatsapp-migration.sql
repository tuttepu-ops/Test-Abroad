-- Run once on existing Supabase project. Adds only an abroad checkout method column.
ALTER TABLE public.abroad_orders
  ADD COLUMN IF NOT EXISTS checkout_method text NOT NULL DEFAULT 'CASHFREE';
-- Existing orders remain CASHFREE; WhatsApp orders are saved as PENDING.
-- No domestic tables, auth records, or policies are modified.
