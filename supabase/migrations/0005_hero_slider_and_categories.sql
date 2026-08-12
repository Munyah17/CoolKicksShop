-- Hero slides no longer require a real photo -- lets the slider run with
-- text-only slides (dark gradient placeholder, handled client-side) until
-- real photography is uploaded.
alter table hero_slides alter column image_url drop not null;

-- Demo catalogue only ever used a single "sneakers" category. Split the
-- existing demo products into real categories so the homepage's
-- category-driven sections have something to show. Swap for real
-- categories as real inventory replaces the demo rows.
update products set category = 'Sneakers' where slug in ('air-classic-07', 'court-vision-low');
update products set category = 'Running' where slug in ('street-runner', 'trail-blazer-mid');
update products set category = 'Basketball' where slug = 'retro-jump-high';

-- Seed 5 active hero slides (no images yet -- shown as dark gradient
-- placeholders by the HeroSlider component until real photography is
-- added via /admin/hero-slides).
insert into hero_slides (headline, subheadline, cta_label, cta_href, display_order, active) values
  ('New Drops, Every Week', 'A small, considered selection of sneakers -- not a warehouse dump.', 'Shop Now', '/shop', 0, true),
  ('Sneakers Done Right', 'Hand-picked pairs, honest pricing, real customer service.', 'Shop Sneakers', '/shop?category=Sneakers', 1, true),
  ('Built For The Run', 'Lightweight runners for everyday miles.', 'Shop Running', '/shop?category=Running', 2, true),
  ('Court Ready', 'High-tops built for the streets, not just the court.', 'Shop Basketball', '/shop?category=Basketball', 3, true),
  ('Delivery Across Zimbabwe', 'Harare, Chitungwiza, Bulawayo and beyond -- or free store pickup.', 'Learn More', '/delivery', 4, true);
