-- Public view exposing safe fields from auth.users
-- Shows up as `public.users` in Table Editor
create or replace view public.users as
select
  id,
  email,
  created_at,
  last_sign_in_at
from auth.users;

-- Allow signed-in clients to read the view
grant usage on schema public to authenticated;
grant select on public.users to authenticated;

comment on view public.users is 'Readonly view of auth.users (safe fields).';
