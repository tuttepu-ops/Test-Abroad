# Godavari Basket Abroad – integration setup

1. Run `supabase/abroad.sql` in the SAME Supabase project used by India. Authentication is shared; `abroad_customers` and `abroad_orders` are separate. Do not run the domestic SQL migrations again.
2. Copy the existing India project’s `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into the **abroad project’s Vercel environment settings**. Never expose the service role key or Cashfree secret with `NEXT_PUBLIC_`.
3. Configure `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_ENV=sandbox` first and `CASHFREE_API_VERSION=2025-01-01`. Use India merchant credentials only if Cashfree has enabled USD international transactions for that account. **Do not go live until a USD transaction is supported and validated.**
4. In Supabase Auth → URL Configuration allow `https://abroad.godavaribasket.com/account` as a redirect URL. The same Google OAuth credentials can remain configured on the same Supabase project (Google Cloud redirect points to Supabase callback). Confirm the project OAuth settings.
5. Add `https://abroad.godavaribasket.com` to approved domains in Cashfree. Verify international payment capability and currency settlement arrangements with Cashfree.
6. `npm install && npm run build`; test Google login, cart, min weight, shipping calculation, failed payment, successful payment and refresh /checkout/return.

Shipping = total shipment weight (products + existing 0.5 kg packaging) × $8. No shipping line in cart drawer. Server recalculates catalog prices and shipping and never trusts client totals.

Important: USD Cashfree order creation may be rejected unless your merchant account supports this currency. This code **fails visibly rather than silently charging INR**. Actual payment confirmation only happens after a server request to Cashfree verifies paid status and USD amount. Do not mark paid from browser redirects alone.

**Production remaining:** Register `https://abroad.godavaribasket.com/api/abroad/webhook` in Cashfree merchant dashboard (webhook signature verification is implemented). Add authenticated admin order list and fulfillment/notification integrations before relying on this as fully unattended commerce.
