-- Drop the direct-update policy that allowed authenticated clients
-- to run arbitrary UPDATE on their own bookings.
drop policy if exists "Clients can cancel own future bookings"
on public.bookings;

-- Drop the old helper function that was only used by the policy above.
drop function if exists public.can_cancel_own_future_booking(uuid);

-- SECURITY DEFINER RPC: the only path for a client to cancel a booking.
-- The function runs with owner privileges so it can update the bookings
-- table even though no for-update RLS policy exists for authenticated
-- clients.
create or replace function public.cancel_own_booking(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid;
  v_updated_id uuid;
begin
  select profiles.member_id
  into v_member_id
  from public.profiles
  where profiles.id = (select auth.uid())
    and profiles.role = 'client';

  if v_member_id is null then
    return false;
  end if;

  update public.bookings
  set status = 'cancelled'
  where bookings.id = p_booking_id
    and bookings.member_id = v_member_id
    and bookings.status = 'confirmed'
    and exists (
      select 1
      from public.sessions
      where sessions.id = bookings.session_id
        and sessions.starts_at > now()
    )
  returning bookings.id into v_updated_id;

  return v_updated_id is not null;
end;
$$;

-- Only authenticated users may call this function.
revoke all on function public.cancel_own_booking(uuid) from public;
grant execute on function public.cancel_own_booking(uuid) to authenticated;