-- Demo catalogue data. Product names are deliberately generic/demo-branded --
-- swap these for real inventory (and real photography) before going live.
-- Product photography is uploaded separately (Supabase Storage / product_images);
-- until then the storefront shows a generated placeholder for each product.

insert into delivery_options (name, type, fee, active, sort_order) values
  ('Harare', 'delivery', 5.00, true, 1),
  ('Chitungwiza', 'delivery', 6.00, true, 2),
  ('Bulawayo', 'delivery', 10.00, true, 3),
  ('Other (contact us)', 'delivery', 12.00, true, 4),
  ('Store Pickup', 'pickup', 0.00, true, 0);

insert into products (slug, name, description, short_description, category, brand, colour, price, sale_price, currency, featured, active) values
  (
    'air-classic-07',
    'Air Classic ''07',
    'A timeless low-top silhouette built for everyday wear. Clean leather upper, cushioned midsole, and a classic sneaker profile that pairs with anything.',
    'Timeless low-top leather sneaker.',
    'sneakers', 'Cool Kicks Select', 'White / Silver', 120.00, null, 'USD', true, true
  ),
  (
    'retro-jump-high',
    'Retro Jump High',
    'A high-top basketball-inspired sneaker with padded ankle support and a bold retro colourway. Made for the streets, not the court.',
    'High-top retro basketball silhouette.',
    'sneakers', 'Cool Kicks Select', 'Black / Red', 150.00, 135.00, 'USD', true, true
  ),
  (
    'street-runner',
    'Street Runner',
    'Lightweight mesh runner with a breathable knit upper and responsive foam sole, built for all-day comfort.',
    'Lightweight breathable runner.',
    'sneakers', 'Cool Kicks Select', 'Triple Black', 95.00, null, 'USD', false, true
  ),
  (
    'court-vision-low',
    'Court Vision Low',
    'A minimal low-top court sneaker in premium leather with a clean white sole. An everyday staple.',
    'Minimal low-top court sneaker.',
    'sneakers', 'Cool Kicks Select', 'White / Off-White', 110.00, null, 'USD', true, true
  ),
  (
    'trail-blazer-mid',
    'Trail Blazer Mid',
    'A rugged mid-top with a chunky outsole and durable overlays, built for city and trail alike.',
    'Rugged mid-top with chunky outsole.',
    'sneakers', 'Cool Kicks Select', 'Charcoal / Olive', 135.00, null, 'USD', false, true
  ),
  (
    'cloud-slide',
    'Cloud Slide',
    'An ultra-soft slide for rest days, made from moulded foam with a contoured footbed.',
    'Ultra-soft everyday slide.',
    'sneakers', 'Cool Kicks Select', 'Black', 45.00, null, 'USD', false, false
  );

-- Sizes/stock per product (UK sizing).
insert into product_sizes (product_id, size, stock, sku)
select id, size, stock, sku from (
  values
    ('air-classic-07', '6', 3, 'CK-AC07-WS-6'),
    ('air-classic-07', '7', 5, 'CK-AC07-WS-7'),
    ('air-classic-07', '8', 6, 'CK-AC07-WS-8'),
    ('air-classic-07', '9', 2, 'CK-AC07-WS-9'),
    ('air-classic-07', '10', 4, 'CK-AC07-WS-10'),
    ('air-classic-07', '11', 0, 'CK-AC07-WS-11'),

    ('retro-jump-high', '7', 2, 'CK-RJH-BR-7'),
    ('retro-jump-high', '8', 3, 'CK-RJH-BR-8'),
    ('retro-jump-high', '9', 4, 'CK-RJH-BR-9'),
    ('retro-jump-high', '10', 1, 'CK-RJH-BR-10'),
    ('retro-jump-high', '11', 0, 'CK-RJH-BR-11'),

    ('street-runner', '6', 4, 'CK-SR-TB-6'),
    ('street-runner', '7', 4, 'CK-SR-TB-7'),
    ('street-runner', '8', 5, 'CK-SR-TB-8'),
    ('street-runner', '9', 5, 'CK-SR-TB-9'),
    ('street-runner', '10', 3, 'CK-SR-TB-10'),

    ('court-vision-low', '6', 2, 'CK-CVL-WO-6'),
    ('court-vision-low', '7', 3, 'CK-CVL-WO-7'),
    ('court-vision-low', '8', 0, 'CK-CVL-WO-8'),
    ('court-vision-low', '9', 3, 'CK-CVL-WO-9'),
    ('court-vision-low', '10', 2, 'CK-CVL-WO-10'),

    ('trail-blazer-mid', '7', 2, 'CK-TBM-CO-7'),
    ('trail-blazer-mid', '8', 3, 'CK-TBM-CO-8'),
    ('trail-blazer-mid', '9', 3, 'CK-TBM-CO-9'),
    ('trail-blazer-mid', '10', 2, 'CK-TBM-CO-10'),
    ('trail-blazer-mid', '11', 1, 'CK-TBM-CO-11'),

    ('cloud-slide', '7', 0, 'CK-CS-BLK-7'),
    ('cloud-slide', '8', 0, 'CK-CS-BLK-8'),
    ('cloud-slide', '9', 0, 'CK-CS-BLK-9')
) as s(slug, size, stock, sku)
join products on products.slug = s.slug;
