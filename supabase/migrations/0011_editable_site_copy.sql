-- Admin-editable site copy: tagline (footer/hero fallback), homepage
-- blurb section, and the About page body. All nullable -- falls back to
-- the hardcoded defaults in code when unset, same pattern as the other
-- settings fields.
alter table settings add column tagline text;
alter table settings add column homepage_blurb_heading text;
alter table settings add column homepage_blurb_body text;
alter table settings add column about_content text;
