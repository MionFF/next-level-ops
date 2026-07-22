-- Add an admin-only read model for sessions operational queries.
--
-- The view is read-only and uses security_invoker so access to every
-- underlying relation continues to be evaluated through its existing RLS
-- policies. The explicit is_admin() predicate prevents this operational
-- surface from becoming available to non-admin authenticated users.

create view public.session_operations
with (security_invoker = true)
as
select
  sessions.id,
  sessions.title,
  sessions.trainer_id,
  trainers.full_name as trainer_name,
  sessions.starts_at,
  sessions.ends_at,
  sessions.capacity,
  sessions.status,
  sessions.created_at,

  coalesce(booking_counts.confirmed_bookings_count, 0)::integer
    as confirmed_bookings_count,

  case
    when sessions.status = 'cancelled'
      then 'cancelled'

    when sessions.ends_at <= now()
      then 'completed'

    when sessions.starts_at <= now()
      and sessions.ends_at > now()
      then 'in_progress'

    when coalesce(booking_counts.confirmed_bookings_count, 0) >= sessions.capacity
      then 'full'

    else 'scheduled'
  end::text as derived_status

from public.sessions

join public.trainers
  on trainers.id = sessions.trainer_id

left join lateral (
  select
    count(*)::integer as confirmed_bookings_count
  from public.bookings
  where bookings.session_id = sessions.id
    and bookings.status = 'confirmed'
) as booking_counts on true

where public.is_admin();


-- Newly created relations can inherit broad default privileges.
-- Remove all implicit access and expose only the intended read contract.

revoke all on public.session_operations from public;
revoke all on public.session_operations from anon;
revoke all on public.session_operations from authenticated;
revoke all on public.session_operations from service_role;

grant select on public.session_operations to authenticated;
grant select on public.session_operations to service_role;