-- scripts/cleanup-e2e-data.sql
-- Manual cleanup for local/staging E2E test data.
-- Do not run against production unless you know exactly what you are doing.

begin;

delete from public.bookings
where member_id in (
  select id from public.members
  where full_name ilike 'E2E %'
     or email ilike 'e2e.%@example.com'
)
or session_id in (
  select id from public.sessions
  where title ilike 'E2E %'
);

delete from public.member_memberships
where member_id in (
  select id from public.members
  where full_name ilike 'E2E %'
     or email ilike 'e2e.%@example.com'
);

update public.profiles
set member_id = null
where member_id in (
  select id from public.members
  where full_name ilike 'E2E %'
     or email ilike 'e2e.%@example.com'
);

delete from public.sessions
where title ilike 'E2E %';

delete from public.members
where full_name ilike 'E2E %'
   or email ilike 'e2e.%@example.com';

commit;