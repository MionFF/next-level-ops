-- Add constrained admin-only RPCs for profile-member linking.
--
-- These functions update only public.profiles.member_id and do not grant
-- broad update access to profiles access-control fields.

create or replace function public.link_profile_to_member(
  p_profile_id uuid,
  p_member_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_member_exists boolean;
  v_member_already_linked boolean;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'code', 'not_admin');
  end if;

  select profiles.id, profiles.role, profiles.member_id
  into v_profile
  from public.profiles
  where profiles.id = p_profile_id
  for update;

  if v_profile.id is null then
    return jsonb_build_object('ok', false, 'code', 'profile_not_found');
  end if;

  if v_profile.role <> 'client' then
    return jsonb_build_object('ok', false, 'code', 'profile_not_client');
  end if;

  if v_profile.member_id is not null then
    return jsonb_build_object('ok', false, 'code', 'profile_already_linked');
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

  select exists (
    select 1
    from public.profiles
    where profiles.member_id = p_member_id
  )
  into v_member_already_linked;

  if v_member_already_linked then
    return jsonb_build_object('ok', false, 'code', 'member_already_linked');
  end if;

  update public.profiles
  set member_id = p_member_id
  where profiles.id = p_profile_id
    and profiles.role = 'client'
    and profiles.member_id is null;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'link_failed');
  end if;

  return jsonb_build_object('ok', true);

exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'member_already_linked');
  when others then
    return jsonb_build_object('ok', false, 'code', 'link_failed');
end;
$$;

create or replace function public.unlink_profile_from_member(
  p_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'code', 'not_admin');
  end if;

  select profiles.id, profiles.role, profiles.member_id
  into v_profile
  from public.profiles
  where profiles.id = p_profile_id
  for update;

  if v_profile.id is null then
    return jsonb_build_object('ok', false, 'code', 'profile_not_found');
  end if;

  if v_profile.role <> 'client' then
    return jsonb_build_object('ok', false, 'code', 'profile_not_client');
  end if;

  if v_profile.member_id is null then
    return jsonb_build_object('ok', false, 'code', 'profile_not_linked');
  end if;

  update public.profiles
  set member_id = null
  where profiles.id = p_profile_id
    and profiles.role = 'client'
    and profiles.member_id is not null;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'unlink_failed');
  end if;

  return jsonb_build_object('ok', true);

exception
  when others then
    return jsonb_build_object('ok', false, 'code', 'unlink_failed');
end;
$$;

revoke all on function public.link_profile_to_member(uuid, uuid) from public;
revoke all on function public.link_profile_to_member(uuid, uuid) from anon;
grant execute on function public.link_profile_to_member(uuid, uuid) to authenticated;

revoke all on function public.unlink_profile_from_member(uuid) from public;
revoke all on function public.unlink_profile_from_member(uuid) from anon;
grant execute on function public.unlink_profile_from_member(uuid) to authenticated;