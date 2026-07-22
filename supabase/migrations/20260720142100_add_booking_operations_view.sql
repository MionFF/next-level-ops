-- Add an admin-only read model for booking operational queries.
--
-- The view is read-only and uses security_invoker so all existing RLS
-- policies on bookings, sessions, members, and trainers remain active.
-- The explicit is_admin() predicate keeps this administrative surface
-- unavailable to client users.

create view public.booking_operations
with (security_invoker = true)
as
select
  bookings.id,
  bookings.session_id,
  bookings.member_id,
  bookings.status,
  bookings.created_at,

  members.full_name as member_name,
  members.email as member_email,

  sessions.title as session_title,
  sessions.starts_at as session_starts_at,
  sessions.ends_at as session_ends_at,

  sessions.trainer_id,
  trainers.full_name as trainer_name,

  case
    when bookings.status = 'cancelled'
      then 'cancelled'

    when sessions.ends_at <= now()
      then 'completed'

    when sessions.starts_at <= now()
      and sessions.ends_at > now()
      then 'in_progress'

    else 'confirmed'
  end::text as derived_status

from public.bookings

join public.members
  on members.id = bookings.member_id

join public.sessions
  on sessions.id = bookings.session_id

join public.trainers
  on trainers.id = sessions.trainer_id

where public.is_admin();


-- Remove implicit privileges and expose only the intended read contract.

revoke all on public.booking_operations from public;
revoke all on public.booking_operations from anon;
revoke all on public.booking_operations from authenticated;
revoke all on public.booking_operations from service_role;

grant select on public.booking_operations to authenticated;
grant select on public.booking_operations to service_role;