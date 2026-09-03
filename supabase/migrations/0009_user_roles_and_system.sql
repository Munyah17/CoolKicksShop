-- Admin roles: super_admin can create/manage other admin accounts;
-- admin handles day-to-day operations only. Existing admin rows default
-- to 'admin' -- promoted individually via migration 0010.
alter table admins add column role text not null default 'admin' check (role in ('super_admin', 'admin'));
