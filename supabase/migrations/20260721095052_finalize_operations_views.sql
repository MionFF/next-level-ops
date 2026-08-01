-- Finalize the sessions and bookings operational read models.
--
-- These views remain read-only, admin-only, and security-invoker based.
-- Existing table RLS policies continue to apply.

create or replace view public.session_operations
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
  end::text as derived_status,

  greatest(
    sessions.capacity - coalesce(booking_counts.confirmed_bookings_count, 0),
    0
  )::integer as available_spots

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


create or replace view public.booking_operations
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
  end::text as derived_status,

  (
    bookings.status = 'confirmed'
    and sessions.starts_at > now()
  ) as is_cancellable

from public.bookings

join public.members
  on members.id = bookings.member_id

join public.sessions
  on sessions.id = bookings.session_id

join public.trainers
  on trainers.id = sessions.trainer_id

where public.is_admin();


-- Reassert the final access contract explicitly.

revoke all on public.session_operations from public;
revoke all on public.session_operations from anon;
revoke all on public.session_operations from authenticated;
revoke all on public.session_operations from service_role;

grant select on public.session_operations to authenticated;
grant select on public.session_operations to service_role;


revoke all on public.booking_operations from public;
revoke all on public.booking_operations from anon;
revoke all on public.booking_operations from authenticated;
revoke all on public.booking_operations from service_role;

grant select on public.booking_operations to authenticated;
grant select on public.booking_operations to service_role;