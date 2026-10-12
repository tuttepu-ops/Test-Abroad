# Godavari Basket Abroad V5 — checkout hardening

## Changes
- Coupon previews bypass the 5 kg minimum only for preview; actual checkout still enforces it.
- Coupon eligibility/discount always calculated server-side from live catalog prices, excluding shipping.
- Improved invalid-cart error descriptions, making outdated catalog IDs easier to identify.
- WhatsApp checkout clears the local cart after an order is successfully saved and a WhatsApp link is returned.
- Cashfree return flow clears the cart only after a successful verification, not before payment.
- Cashfree order records carry `checkout_method=CASHFREE`; WhatsApp uses `WHATSAPP`.

## Requirements and checks
- Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, Cashfree credentials and sheet URLs exist in `.env.local`.
- Already created `abroad_coupons` and `abroad_orders` columns need no migration.
- Test coupon, product variants, 5 kg minimum, WhatsApp redirect and Cashfree sandbox end to end before production.
- The coupon 400 response body is the primary debugging signal. Live Supabase/Google Sheets/Cashfree calls cannot be tested without your credentials.
- A saved WhatsApp order is not a confirmed WhatsApp message or payment.
- For coupons with `usage_limit`, implement a transactional redemption strategy before enabling a limited-use promotion.
