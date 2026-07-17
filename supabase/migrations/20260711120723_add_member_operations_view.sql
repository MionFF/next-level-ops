-- Add an admin-only read model for the members operations table.
--
-- The view is intentionally read-only and does not introduce any mutation flow.
-- It uses security_invoker so all underlying table RLS policies remain active.
-- The explicit admin predicate prevents clients from using this operational
-- surface even when they can read their own member-related records directly.

create view public.member_operations
with (security_invoker = true)
as
select
  members.id,
  members.full_name,
  members.email,
  members.phone,
  members.status,
  members.created_at,

  exists (
    select 1
    from public.profiles
    where profiles.member_id = members.id
  ) as is_profile_linked,

  coalesce(selected_membership.membership_status, 'none') as membership_status,
  selected_membership.plan_name as membership_plan_name,
  selected_membership.starts_at as membership_starts_at,
  selected_membership.ends_at as membership_ends_at

from public.members

left join lateral (
  select
    case
      when member_memberships.status = 'active'
        and member_memberships.starts_at <= now()
        and member_memberships.ends_at > now()
        then 'active'

      when member_memberships.status = 'active'
        and member_memberships.starts_at > now()
        then 'upcoming'

      when member_memberships.status = 'active'
        and member_memberships.ends_at <= now()
        then 'expired'

      when member_memberships.status = 'cancelled'
        then 'cancelled'
    end as membership_status,

    membership_plans.name as plan_name,
    member_memberships.starts_at,
    member_memberships.ends_at

  from public.member_memberships

  join public.membership_plans
    on membership_plans.id = member_memberships.plan_id

  where member_memberships.member_id = members.id

  order by
    case
      when member_memberships.status = 'active'
        and member_memberships.starts_at <= now()
        and member_memberships.ends_at > now()
        then 1

      when member_memberships.status = 'active'
        and member_memberships.starts_at > now()
        then 2

      when member_memberships.status = 'active'
        and member_memberships.ends_at <= now()
        then 3

      when member_memberships.status = 'cancelled'
        then 4

      else 5
    end,

    case
      when member_memberships.status = 'active'
        and member_memberships.starts_at > now()
        then member_memberships.starts_at
    end asc nulls last,

    case
      when member_memberships.status = 'active'
        and member_memberships.starts_at <= now()
        and member_memberships.ends_at > now()
        then member_memberships.ends_at
    end desc nulls last,

    case
      when member_memberships.status = 'active'
        and member_memberships.ends_at <= now()
        then member_memberships.ends_at
    end desc nulls last,

    case
      when member_memberships.status = 'cancelled'
        then member_memberships.updated_at
    end desc nulls last,

    member_memberships.created_at desc

  limit 1
) as selected_membership on true

where public.is_admin();

-- Default privileges in this project grant broad access to newly created
-- relations. Remove those grants and expose only read access to authenticated
-- callers. Row access is still restricted by security_invoker, underlying RLS,
-- and the explicit public.is_admin() predicate.

revoke all on public.member_operations from public;
revoke all on public.member_operations from anon;
revoke all on public.member_operations from authenticated;

grant select on public.member_operations to authenticated;

-- Keep service-role access explicit for maintenance and verification.
revoke all on public.member_operations from service_role;
grant select on public.member_operations to service_role;