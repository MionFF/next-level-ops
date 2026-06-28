-- Create an admin-only booking creation RPC.
--
-- The function serializes booking creation per session row and enforces
-- booking business invariants inside the database-backed workflow.

create or replace function public.create_admin_booking(
  p_session_id uuid,
  p_member_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session record;
  v_member_exists boolean;
  v_confirmed_count integer;
  v_duplicate_exists boolean;
  v_booking_id uuid;
begin
  if not exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  ) then
    return jsonb_build_object('ok', false, 'code', 'not_admin');
  end if;

  select sessions.id, sessions.status, sessions.capacity, sessions.starts_at
  into v_session
  from public.sessions
  where sessions.id = p_session_id
  for update;

  if v_session.id is null then
    return jsonb_build_object('ok', false, 'code', 'session_not_found');
  end if;

  select exists (
    select 1
    from public.members
    where members.id = p_member_id
  )
  into v_member_exists;

  if not v_member_exists then
    return jsonb_build_object('ok', false, 'code', 'member_not_found');
  end if;

  if v_session.status = 'cancelled' then
    return jsonb_build_object('ok', false, 'code', 'session_cancelled');
  end if;

  if v_session.starts_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'session_not_future');
  end if;

  select count(*)
  into v_confirmed_count
  from public.bookings
  where bookings.session_id = p_session_id
    and bookings.status = 'confirmed';

  if v_confirmed_count >= v_session.capacity then
    return jsonb_build_object('ok', false, 'code', 'session_full');
  end if;

  select exists (
    select 1
    from public.bookings
    where bookings.session_id = p_session_id
      and bookings.member_id = p_member_id
      and bookings.status = 'confirmed'
  )
  into v_duplicate_exists;

  if v_duplicate_exists then
    return jsonb_build_object('ok', false, 'code', 'duplicate_booking');
  end if;

  insert into public.bookings (session_id, member_id, status)
  values (p_session_id, p_member_id, 'confirmed')
  returning bookings.id into v_booking_id;

  return jsonb_build_object(
    'ok', true,
    'booking_id', v_booking_id
  );

exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'duplicate_booking');
  when others then
    return jsonb_build_object('ok', false, 'code', 'insert_failed');
end;
$$;

revoke all on function public.create_admin_booking(uuid, uuid) from public;
grant execute on function public.create_admin_booking(uuid, uuid) to authenticated;