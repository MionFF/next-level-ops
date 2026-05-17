drop policy if exists "Clients can cancel own future bookings"
on public.bookings;

create or replace function public.can_cancel_own_future_booking(booking_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bookings
    join public.sessions
      on sessions.id = bookings.session_id
    join public.profiles
      on profiles.member_id = bookings.member_id
    where bookings.id = booking_id
      and profiles.id = (select auth.uid())
      and bookings.status = 'confirmed'
      and sessions.starts_at > now()
  );
$$;

revoke all on function public.can_cancel_own_future_booking(uuid) from public;
grant execute on function public.can_cancel_own_future_booking(uuid) to authenticated;

create policy "Clients can cancel own future bookings"
on public.bookings
for update
to authenticated
using (
  public.can_cancel_own_future_booking(id)
)
with check (
  status = 'cancelled'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.member_id = bookings.member_id
  )
);