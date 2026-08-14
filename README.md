# Cool Kicks

A small, fast, premium sneaker storefront for a Zimbabwean sneaker business (trading as
**Got The Shoe**). Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and
Paynow Zimbabwe's hosted checkout.

This is deliberately a boutique-scale build — a handful of products, guest checkout, no
accounts required — not an enterprise commerce platform. See [`lib/config.ts`](lib/config.ts)
for the one place brand name/tagline/social links live.

## Architecture

```
app/
  page.tsx                Home
  shop/                   Product grid, search, sort
  product/[slug]/         Product detail
  cart/                   Full-page cart
  checkout/               Contact -> Delivery -> Review -> Pay Now
  order/[reference]/      Order confirmation, polls for payment result
  about/, contact/, delivery/, legal/   Static/info pages
  admin/                  Admin dashboard (Supabase Auth + `admins` table)
  api/
    checkout/             Creates an order, initiates Paynow, returns redirect URL
    paynow/
      result/             Paynow's server-to-server notification (authoritative)
      status/             Client-polled status + secondary verification/recovery
      retry/              Restart payment on an existing unpaid order
      mock-poll/          Dev-only: stands in for Paynow's poll URL
    dev/paynow-simulate/  Dev-only: drives the mock checkout

lib/
  supabase/     server (RLS, cookies), admin (service role), browser (client auth)
  paynow/       hash algorithm, HTTP client, dev mock provider, provider selection
  orders/       server-authoritative order creation, payment processing, order lookups
  admin/        admin-only server actions (products, orders, delivery) + dashboard queries
  catalogue/    public product/delivery queries
  cart/         guest cart (localStorage-backed React context)
  validation/   zod schemas for checkout and the product form

supabase/migrations/   versioned SQL schema, RLS policies, seed data
```

### Order & payment flow

```
Checkout form -> POST /api/checkout
  -> re-verify every price/size/stock from the DB (never trust the browser)
  -> create order + order_items + payments row
  -> initiate a Paynow transaction, get back a hosted checkout URL
  -> redirect the customer to Paynow

Paynow  -> POST /api/paynow/result  (authoritative; verified by hash, amount, idempotent)
        -> updates payment_status / order_status, decrements stock atomically

Customer redirected back to /order/[reference]
  -> polls /api/paynow/status while payment is still "pending"
  -> that route also actively re-polls Paynow as a recovery path if the
     webhook hasn't arrived yet
```

Payment states: `pending -> paid | failed | cancelled`. Order states:
`pending_payment -> paid -> processing -> ready_for_dispatch -> delivered` (or `cancelled`).
Admins can move fulfilment state forward; `payment_status` and the `paid` order state are only
ever set by verified Paynow events.

### Paynow integration

Implemented directly from Paynow's official Node SDK source (endpoint, field order, SHA512 hash
algorithm, response format) — see [`lib/paynow/hash.ts`](lib/paynow/hash.ts) and
[`lib/paynow/client.ts`](lib/paynow/client.ts). Credentials
(`PAYNOW_INTEGRATION_ID`/`PAYNOW_INTEGRATION_KEY`) are server-only and never sent to the browser.

**No credentials configured?** The app automatically falls back to a local mock checkout at
`/dev/paynow`, which sends the exact same hash-signed notification shape through the real
`/api/paynow/result` verification pipeline — it's a stand-in for Paynow, not a shortcut around
the payment logic. This mock is hard-disabled the moment `NODE_ENV=production`; a production
deploy without real Paynow credentials will fail at request time rather than silently faking
payments. A `Test Mode` banner appears site-wide whenever the mock is active.

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the
   migrations in `supabase/migrations/` against it, in order (via the Supabase SQL editor, or
   the Supabase CLI: `supabase db push`). This creates the schema, RLS policies, and seed
   catalogue data.

3. **Create an admin user**: in the Supabase dashboard under Authentication, add a user (email +
   password). Then, in the SQL editor, grant it admin access:
   ```sql
   insert into admins (user_id) values ('<the user''s UUID from Authentication>');
   ```

4. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project's API settings. Leave
   `PAYNOW_INTEGRATION_ID`/`PAYNOW_INTEGRATION_KEY` blank for now — checkout will use the local
   mock at `/dev/paynow` until you add real Paynow credentials.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:6137`. Admin is at `/admin/login`.

## Going live with Paynow

Get integration credentials from [Paynow Zimbabwe](https://www.paynow.co.zw) (Merchant
dashboard -> Integrations), set `PAYNOW_INTEGRATION_ID` and `PAYNOW_INTEGRATION_KEY` in your
production environment, and set `NEXT_PUBLIC_SITE_URL` to your real domain (Paynow needs a
publicly reachable `resulturl`). The app will refuse to start in production without these two
variables set — this is intentional, so a misconfigured deploy fails loudly instead of quietly
faking payments.

## Production build

```bash
npm run lint
npm run build
npm run start
```

Designed to run in any Node.js environment — Vercel, or a cPanel host with Node.js/Passenger
support. No PHP, no separate backend process.

## Environment variables

See [`.env.example`](.env.example). Never commit `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` and
the Paynow credentials are server-only secrets — nothing prefixed `NEXT_PUBLIC_` should ever
hold a secret.
