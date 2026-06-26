-- Harden profile self-update access.
--
-- Users may read their own profile and update only safe profile fields.
-- Sensitive access-control fields such as role and member_id must remain
-- system/admin-controlled and must not be self-editable by clients.

drop policy if exists "Users can update own profile"
on public.profiles;

revoke update on public.profiles from authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Users can update own profile full name"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);