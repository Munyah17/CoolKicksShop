-- Cool Kicks: initial schema
-- Small, lean schema for a boutique sneaker shop with guest checkout via Paynow.

create extension if not exists pgcrypto;

-- ============================================================
-- PRODUCTS
-- ============================================================
-- "category" is a free-text field (not a separate table) so the
-- catalogue can grow into other product types later without a
-- schema change (e.g. "sneakers", "t-shirts").

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  short_description text,
  category text not null default 'sneakers',
  brand text,
  colour text,
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price >= 0),
  currency text not null default 'USD',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_featured_idx on products (active, featured);
create index products_category_idx on products (category);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text,
  display_order int not null default 0,
  is_primary boolean not null default false
);

create index product_images_product_id_idx on product_images (product_id);

create table product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text not null,
  stock int not null default 0 check (stock >= 0),
  sku text,
  unique (product_id, size)
);

create index product_sizes_product_id_idx on product_sizes (product_id);

-- ============================================================
-- DELIVERY
-- ============================================================

create table delivery_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('delivery', 'pickup')),
  fee numeric(10, 2) not null default 0 check (fee >= 0),
  active boolean not null default true,
  sort_order int not null default 0
);

-- ============================================================
-- ORDERS
-- ============================================================

create sequence order_reference_seq start 10001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('CK-' || nextval('order_reference_seq')::text),
  customer_name text not null,
  phone text not null,
  email text,
  address text,
  city text,
  delivery_notes text,
  delivery_option_id uuid references delivery_options (id),
  delivery_method text not null check (delivery_method in ('delivery', 'pickup')),
  delivery_fee numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cancelled')),
  order_status text not null default 'pending_payment'
    check (order_status in ('pending_payment', 'paid', 'processing', 'ready_for_dispatch', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_reference_idx on orders (reference);
create index orders_payment_status_idx on orders (payment_status);
create index orders_order_status_idx on orders (order_status);
create index orders_created_at_idx on orders (created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_size_id uuid references product_sizes (id) on delete set null,
  product_name text not null,
  size text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create index order_items_order_id_idx on order_items (order_id);

-- ============================================================
-- PAYMENTS (Paynow)
-- ============================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  provider text not null default 'paynow',
  merchant_reference text not null unique,
  paynow_reference text,
  poll_url text,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  raw_last_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_checked_at timestamptz
);

create index payments_order_id_idx on payments (order_id);
create index payments_merchant_reference_idx on payments (merchant_reference);

-- ============================================================
-- ADMIN
-- ============================================================
-- Admin access is granted by inserting a row here for a Supabase Auth
-- user id. There is no self-service sign-up path for this table.

create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- updated_at triggers
-- ============================================================

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

create trigger payments_set_updated_at before update on payments
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Catalogue data is publicly readable (active items only).
-- Orders/payments/admins have no public policies at all -- every
-- read or write to them happens server-side with the service role
-- key, after the server has independently verified the request
-- (checkout validation, Paynow hash verification, or admin session).

alter table products enable row level security;
alter table product_images enable row level security;
alter table product_sizes enable row level security;
alter table delivery_options enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table admins enable row level security;

create policy "public can read active products"
  on products for select
  using (active = true);

create policy "public can read images of active products"
  on product_images for select
  using (exists (
    select 1 from products
    where products.id = product_images.product_id
    and products.active = true
  ));

create policy "public can read sizes of active products"
  on product_sizes for select
  using (exists (
    select 1 from products
    where products.id = product_sizes.product_id
    and products.active = true
  ));

create policy "public can read active delivery options"
  on delivery_options for select
  using (active = true);
