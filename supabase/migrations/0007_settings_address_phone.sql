-- Business address and a plain phone number, distinct from the WhatsApp
-- number (some customers call rather than message). Additive only.
alter table settings add column address text;
alter table settings add column phone text;
