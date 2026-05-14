create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  trainer_id uuid not null references public.trainers(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.sessions enable row level security;

create trigger update_sessions_updated_at
before update on public.sessions
for each row
execute procedure public.update_updated_at_column();

create index sessions_trainer_id_idx on public.sessions (trainer_id);
create index sessions_starts_at_idx on public.sessions (starts_at);
create index sessions_status_idx on public.sessions (status);

create policy "Admins can view sessions"
on public.sessions
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

create policy "Admins can create sessions"
on public.sessions
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

create policy "Admins can update sessions"
on public.sessions
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

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  member_id uuid not null references public.members(id),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create trigger update_bookings_updated_at
before update on public.bookings
for each row
execute procedure public.update_updated_at_column();

create index bookings_session_id_idx on public.bookings (session_id);
create index bookings_member_id_idx on public.bookings (member_id);
create index bookings_status_idx on public.bookings (status);

create unique index bookings_unique_confirmed_member_session_idx
on public.bookings (session_id, member_id)
where status = 'confirmed';

create policy "Admins can view bookings"
on public.bookings
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

create policy "Admins can create bookings"
on public.bookings
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

create policy "Admins can update bookings"
on public.bookings
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