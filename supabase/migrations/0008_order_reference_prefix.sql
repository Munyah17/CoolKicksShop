-- Rebrand: new orders get a GI- reference prefix instead of CK-. Existing
-- order references are untouched (this only changes the default for new rows).
alter table orders alter column reference set default ('GI-' || nextval('order_reference_seq')::text);
