-- Optional customer accounts (guest checkout remains fully supported),
-- site settings (currently just the logo), and homepage hero slides --
-- all admin-managed rather than hard-coded.

-- ============================================================
-- CUSTOMER ACCOUNTS
-- ============================================================
-- Nullable: guest checkout never sets this. When a logged-in customer
-- checks out, the order is linked to them so it shows up in /account.

alter table orders add column user_id uuid references auth.users (id) on delete set null;
create index orders_user_id_idx on orders (user_id);

create policy "customers can read their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "customers can read their own order items"
  on order_items for select
  using (exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  ));

-- ============================================================
-- SETTINGS (singleton row)
-- ============================================================

create table settings (
  id boolean primary key default true check (id),
  logo_url text,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (true);

create trigger settings_set_updated_at before update on settings
  for each row execute function set_updated_at();

alter table settings enable row level security;

create policy "public can read settings"
  on settings for select
  using (true);

-- ============================================================
-- HOME PAGE HERO SLIDES
-- ============================================================

create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  headline text,
  subheadline text,
  cta_label text,
  cta_href text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index hero_slides_active_order_idx on hero_slides (active, display_order);

alter table hero_slides enable row level security;

create policy "public can read active hero slides"
  on hero_slides for select
  using (active = true);
