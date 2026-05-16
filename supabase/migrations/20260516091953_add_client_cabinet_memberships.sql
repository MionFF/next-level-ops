alter table public.profiles
add column member_id uuid;

alter table public.profiles
add constraint profiles_member_id_fkey
foreign key (member_id)
references public.members(id)
on delete set null;

create unique index profiles_member_id_key
on public.profiles (member_id)
where member_id is not null;

create index profiles_member_id_idx
on public.profiles (member_id);

create table public.member_memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.member_memberships enable row level security;

create trigger update_member_memberships_updated_at
before update on public.member_memberships
for each row
execute procedure public.update_updated_at_column();

create index member_memberships_member_id_idx
on public.member_memberships (member_id);

create index member_memberships_plan_id_idx
on public.member_memberships (plan_id);

create index member_memberships_status_idx
on public.member_memberships (status);

create index member_memberships_dates_idx
on public.member_memberships (starts_at, ends_at);

create policy "Admins can view member memberships"
on public.member_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can create member memberships"
on public.member_memberships
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can update member memberships"
on public.member_memberships
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Clients can view own member"
on public.members
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.member_id = members.id
  )
);

create policy "Clients can view own memberships"
on public.member_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.member_id = member_memberships.member_id
  )
);

create policy "Clients can view own membership plans"
on public.membership_plans
for select
to authenticated
using (
  exists (
    select 1
    from public.member_memberships
    join public.profiles
      on profiles.member_id = member_memberships.member_id
    where profiles.id = (select auth.uid())
      and member_memberships.plan_id = membership_plans.id
  )
);

create policy "Clients can view own bookings"
on public.bookings
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.member_id = bookings.member_id
  )
);

create policy "Clients can cancel own future bookings"
on public.bookings
for update
to authenticated
using (
  status = 'confirmed'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.member_id = bookings.member_id
  )
  and exists (
    select 1
    from public.sessions
    where sessions.id = bookings.session_id
      and sessions.starts_at > now()
  )
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

create policy "Clients can view sessions for own bookings"
on public.sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.bookings
    join public.profiles
      on profiles.member_id = bookings.member_id
    where profiles.id = (select auth.uid())
      and bookings.session_id = sessions.id
  )
);

create policy "Clients can view trainers for own booked sessions"
on public.trainers
for select
to authenticated
using (
  exists (
    select 1
    from public.sessions
    join public.bookings
      on bookings.session_id = sessions.id
    join public.profiles
      on profiles.member_id = bookings.member_id
    where profiles.id = (select auth.uid())
      and sessions.trainer_id = trainers.id
  )
);