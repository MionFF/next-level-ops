-- Add database-backed operational ordering metadata for Sessions and Bookings.
--
-- "Upcoming first" keeps the complete result set visible while ordering:
--   1. current/actionable records first, by start time ascending
--   2. terminal/cancelled records after them, by start time descending
--
-- Literal "soonest" and "latest" sorting continues to use the original
-- timestamp columns directly in application queries.

create or replace view public.session_operations
with (security_invoker = true)
as
with session_base as (
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

  where public.is_admin()
)

select
  id,
  title,
  trainer_id,
  trainer_name,
  starts_at,
  ends_at,
  capacity,
  status,
  created_at,
  confirmed_bookings_count,
  derived_status,
  available_spots,

  case
    when derived_status in ('in_progress', 'scheduled', 'full')
      then 0
    else 1
  end::integer as operational_sort_group,

  case
    when derived_status in ('in_progress', 'scheduled', 'full')
      then extract(epoch from starts_at)
    else -extract(epoch from starts_at)
  end as operational_sort_key

from session_base;


create or replace view public.booking_operations
with (security_invoker = true)
as
with booking_base as (
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

  where public.is_admin()
)

select
  id,
  session_id,
  member_id,
  status,
  created_at,
  member_name,
  member_email,
  session_title,
  session_starts_at,
  session_ends_at,
  trainer_id,
  trainer_name,
  derived_status,
  is_cancellable,

  case
    when derived_status in ('in_progress', 'confirmed')
      then 0
    else 1
  end::integer as operational_sort_group,

  case
    when derived_status in ('in_progress', 'confirmed')
      then extract(epoch from session_starts_at)
    else -extract(epoch from session_starts_at)
  end as operational_sort_key

from booking_base;