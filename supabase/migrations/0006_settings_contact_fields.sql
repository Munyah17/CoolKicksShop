-- Admin-editable contact details, shown on /contact. Purely additive --
-- existing "settings" singleton row and its RLS policy are untouched.
alter table settings add column instagram_url text;
alter table settings add column whatsapp_number text;
alter table settings add column contact_email text;
