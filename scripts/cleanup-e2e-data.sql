-- scripts/cleanup-e2e-data.sql
-- Manual cleanup for local/staging E2E test data.
-- Do not run against production unless you know exactly what you are doing.

begin;

create temp table cleanup_e2e_members on commit drop as
select id
from public.members
where full_name ~* '^E2E Member e2e-[0-9]+(-[a-z0-9]+)?( .*)?$'
   or email ~* '^member\.e2e-[0-9]+(-[a-z0-9]+)?@example\.com$';

create temp table cleanup_e2e_sessions on commit drop as
select id
from public.sessions
where title ~* '^E2E Session e2e-[0-9]+(-[a-z0-9]+)?( .*)?$';

create temp table cleanup_e2e_trainers on commit drop as
select id
from public.trainers
where full_name ~* '^E2E Trainer e2e-[0-9]+(-[a-z0-9]+)?( .*)?$'
   or email ~* '^trainer\.e2e-[0-9]+(-[a-z0-9]+)?@example\.com$';

delete from public.bookings
where member_id in (
  select id
  from cleanup_e2e_members
)
or session_id in (
  select id
  from cleanup_e2e_sessions
);

delete from public.member_memberships
where member_id in (
  select id
  from cleanup_e2e_members
);

update public.profiles
set member_id = null
where member_id in (
  select id
  from cleanup_e2e_members
);

delete from public.sessions
where id in (
  select id
  from cleanup_e2e_sessions
);

delete from public.members
where id in (
  select id
  from cleanup_e2e_members
);

delete from public.trainers
where id in (
  select id
  from cleanup_e2e_trainers
);

delete from auth.users
where email ~* '^client\.e2e-[0-9]+(-[a-z0-9]+)?@example\.com$'
   or (raw_user_meta_data ->> 'full_name') ~* '^E2E Client e2e-[0-9]+(-[a-z0-9]+)?( .*)?$';

commit;