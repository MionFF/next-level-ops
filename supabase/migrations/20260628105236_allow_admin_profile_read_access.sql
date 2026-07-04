-- Allow admins to read app profiles for operational profile-member linking.
--
-- This preserves profile access-control hardening: users still cannot self-update
-- profiles.role or profiles.member_id.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can view profiles" on public.profiles;

create policy "Admins can view profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());