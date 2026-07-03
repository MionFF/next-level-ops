-- scripts/cleanup-e2e-data.sql
-- Manual cleanup for local/staging E2E test data.
-- Do not run against production unless you know exactly what you are doing.

begin;

delete from public.bookings
where member_id in (
  select id
  from public.members
  where full_name ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$'
)
or session_id in (
  select id
  from public.sessions
  where title ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$'
);

delete from public.member_memberships
where member_id in (
  select id
  from public.members
  where full_name ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$'
);

update public.profiles
set member_id = null
where member_id in (
  select id
  from public.members
  where full_name ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$'
);

delete from public.sessions
where title ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$';

delete from public.members
where full_name ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$';

delete from public.trainers
where full_name ~* '^E2E .+ e2e-[0-9]+(-[a-z0-9]+)?$';

delete from auth.users
where email ~* '^client\.e2e-[0-9]+(-[a-z0-9]+)?@example\.com$'
   or (raw_user_meta_data ->> 'full_name') ~* '^E2E Client e2e-[0-9]+(-[a-z0-9]+)?$';

commit;
