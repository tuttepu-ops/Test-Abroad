# Abroad Checkout V3 — setup

This release preserves the existing site design and changes only login styling and checkout options.

## Existing Supabase installations
Run `supabase/abroad-whatsapp-migration.sql` in your Supabase SQL Editor. This only adds `checkout_method` to `public.abroad_orders` and defaults earlier orders to CASHFREE. Do not rerun the full setup SQL just for this change.

## Environment
Keep all existing Supabase and Cashfree sandbox settings. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to your business number with country code (digits only), e.g. `919XXXXXXXXX`. Never expose server-side Cashfree keys in NEXT_PUBLIC variables.

## Checkout
The customer must sign in before either checkout option. The server recalculates all catalog totals, adds transport at checkout, and saves orders in `abroad_orders`. `Pay securely` creates a Cashfree order; `Checkout via WhatsApp` saves an order with `payment_status=PENDING`, `checkout_method=WHATSAPP`, then opens WhatsApp with an itemized message and order reference. WhatsApp checkout does NOT verify payment, automatically mark paid, or create a Cashfree order.

## Testing
Test guest login, Google OAuth return, account page, USD sandbox eligibility, both checkout methods, WhatsApp order in Supabase, webhook payment verification, and return page before production.
