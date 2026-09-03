-- Promote the existing Munyah account (munyamuzvidziwa19@gmail.com) to
-- super_admin. Other pre-existing admin rows stay at the 'admin' default.
update admins set role = 'super_admin' where user_id = 'ee162074-0dd8-448d-bbdb-3a69a714ba6f';
