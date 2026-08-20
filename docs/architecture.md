# Architecture Notes

Next Level Ops is a full-stack, role-based operations dashboard for a fitness studio.

The application is built as a production-shaped MVP: it focuses on operational workflows, role-based access, server-side data boundaries, forms, mutations, discoverability, and testable critical paths. It is not a marketing site, a consumer fitness app, or a payment/subscription platform.

## Product model

The MVP has two authenticated roles:

- **Admin** — manages the studio's operational data: members, trainers, membership plans, sessions, and bookings.
- **Client** — uses a limited cabinet to view linked studio data, active membership information, upcoming bookings, booking history, and cancel their own future bookings.

Unauthenticated users can access only public auth routes.

The product intentionally keeps booking creation and membership assignment admin-managed in the MVP. Client self-booking, payments, Stripe, checkout, trainer accounts, and full membership lifecycle automation are out of scope.

## Route structure

The app uses Next.js App Router with route groups for public, admin, and client areas.

High-level route areas:

```txt
/
/sign-in
/sign-up
/forbidden
/dashboard
/dashboard/members
/dashboard/trainers
/dashboard/plans
/dashboard/profile-links
/dashboard/sessions
/dashboard/bookings
/cabinet
/cabinet/bookings
```

The root route (`/`) acts as a safe role-aware redirect resolver:

- unauthenticated users are sent to `/sign-in`
- admins are sent to `/dashboard`
- clients are sent to `/cabinet`
- unknown/missing roles fall back to `/forbidden`

Admin routes are protected in the dashboard layout. Client routes are protected in the cabinet layout. This keeps role-area routing simple and avoids exposing role names inside deeper URL structures.

## Folder structure

The project is FSD-inspired, but not dogmatic FSD.

```txt
app/       routing, layouts, route-level server orchestration
features/  product flows and domain-specific UI/actions/model logic
widgets/   larger composition blocks such as admin/client shells
shared/    reusable UI, config, and generic helpers
lib/       infrastructure helpers such as Supabase clients
docs/      project decisions and architecture documentation
supabase/  database migrations
scripts/   project maintenance scripts
```

`app` should stay thin. It owns routing, page-level orchestration, redirects, and data loading composition. Business logic, form schemas, server actions, UI components, and domain helpers live closer to the relevant feature.

## Core domain model

The most important domain distinction is:

```txt
auth user != app profile != studio member
```

### Auth identity

Supabase Auth owns authentication identity through `auth.users`.

### Profiles

`public.profiles` is the application-level user profile table. It stores the app role (`admin` or `client`) and, for client users, can link the authenticated profile to a real studio member through `profiles.member_id`.

`profiles.role` and `profiles.member_id` are access-control fields. Authenticated users may read their own profile and may update only safe self-service fields such as `full_name`. Users must not be able to self-assign roles or self-link to members. Role assignment and member linking remain system/admin-controlled flows.

### Members

`public.members` represents real fitness studio clients. Members are business records managed by admins. They are not automatically created when someone signs up.

### Trainers

`public.trainers` stores admin-managed trainer records. Trainers do not have auth accounts or a trainer portal in the MVP.

### Membership plans

`public.membership_plans` stores reusable plan/catalog records.

A plan is not the same as an assigned member membership. Plans define reusable commercial attributes such as name, description, duration, price, and catalog status.

### Member memberships

`public.member_memberships` connects a member to a membership plan for a specific date range. It represents concrete member-plan assignments.

```txt
membership_plans
  -> reusable catalog of plans the studio sells

member_memberships
  -> concrete plan assignments for specific members
```

The current membership model is deliberately simple:

- stored statuses: `active`, `cancelled`
- runtime states: `active`, `upcoming`, `expired`, `cancelled`
- `expired` is derived from dates and is not written back to the database
- payments, checkout, freezing, and renewal automation are out of scope

Runtime states are derived from stored status and dates:

```txt
active    = status active + now inside starts_at/ends_at
upcoming  = status active + starts_at is in the future
expired   = status active + ends_at is in the past
cancelled = stored status cancelled
```

### Sessions

`public.sessions` represents scheduled studio events. Each session belongs to a trainer and has capacity, start/end times, and a minimal stored status.

Statuses such as `Completed`, `In progress`, and `Full` are derived in application code from time, capacity, and confirmed bookings.

### Bookings

`public.bookings` connects a member to a session.

Bookings are not deleted when cancelled. Cancellation updates `bookings.status` to `cancelled`, preserving operational history.

## Auth and access model

Access control is layered.

### Route protection

Route layouts protect broad app areas:

- `/dashboard/*` requires an authenticated admin
- `/cabinet/*` requires an authenticated client
- unauthorized role access redirects to `/forbidden`

This protects the user experience and prevents users from navigating into the wrong area.

### Data protection

Route protection is not treated as the only security layer.

Supabase Row Level Security and constrained database access protect data boundaries:

- admins can manage operational data
- clients can only read their own linked member data
- clients can only see memberships, bookings, sessions, trainers, and plans that are connected to their own member record
- client cancellation is restricted to own confirmed future bookings

### Role assignment

Public sign-up creates client users only. Admin role assignment is manual in the MVP to prevent privilege escalation and keep access control explicit.

## Client cabinet ownership chain

Client cabinet data resolves through this chain:

```txt
auth.uid()
  -> public.profiles.id
  -> public.profiles.member_id
  -> public.members.id
```

This is why `profiles.member_id` exists: the cabinet starts from the currently authenticated user, then resolves the linked business member record.

If a client profile is not linked to a member record, the cabinet can render an empty/unlinked state instead of exposing unrelated data.

## Profile-member linking workflow

Client sign-up creates an app profile, but it does not create a studio member record automatically.

Admins manage the profile-member relationship from `/dashboard/profile-links`. The page shows:

- unlinked client profiles
- unlinked studio members
- current linked profile-member pairs

Linking and unlinking are intentionally admin-controlled because `profiles.member_id` is an access-control field for the client cabinet ownership chain.

The UI does not update `profiles.member_id` through broad table update access. It calls constrained Supabase RPCs:

```txt
public.link_profile_to_member(p_profile_id uuid, p_member_id uuid)
public.unlink_profile_from_member(p_profile_id uuid)
```

The RPCs:

- require the caller to be an admin
- allow linking only client profiles
- prevent linking an already linked profile
- prevent linking a member that is already linked to another profile
- update only `public.profiles.member_id`
- return structured success/error codes for server action message mapping

If a profile is unlinked, the client cabinet keeps rendering the unlinked state instead of exposing unrelated member data.

## Member membership management

Admins manage a member's assigned memberships from the member detail page:

```txt
/dashboard/members/[memberId]
```

The page shows:

- current membership
- membership history
- assign/renew form
- cancellation controls for active/upcoming memberships

The workflow supports assigning a membership when the member has no current active membership, renewing a membership by creating the next non-overlapping period, and cancelling active or upcoming memberships.

Membership assignment is implemented through server actions and existing admin RLS access, not through a dedicated RPC. Unlike `profiles.member_id`, `member_memberships` is not an access-control field. It is a normal admin-managed business entity.

The assign action validates:

- caller is admin
- member exists
- selected plan exists
- selected plan is active
- start date is today or later
- end date is calculated from `membership_plans.duration_days`
- the new period does not overlap another active membership period for the same member

The overlap rule is:

```txt
existing.starts_at < new.ends_at
AND
existing.ends_at > new.starts_at
```

This blocks parallel active/scheduled memberships while still allowing adjacent renewal where the new membership starts exactly when the previous one ends.

The cancel action updates `member_memberships.status` to `cancelled`; it does not delete the row.

Client cabinet reads the linked member's currently active membership through the ownership chain and renders a no-active-membership state when no current membership exists.

Payments, billing, invoices, checkout, client self-purchase, freezing/pausing memberships, discounts, and automatic renewal are out of scope.

## Mutation model

Most product mutations are implemented with server actions.

Server actions handle form submissions, validate data, call Supabase, and trigger revalidation where needed. Form components use `useActionState` and expose optional action props for test injection, while production defaults still use the real server actions.

### Booking invariants

Admin booking creation uses the constrained `public.create_admin_booking` RPC. The server action validates the form and admin access, then delegates session/member validation, future-session checks, capacity enforcement, duplicate confirmed booking prevention, and insert behavior to the RPC.

The RPC locks the target session row during creation, so concurrent booking attempts for the same session cannot bypass capacity checks.

Admin cancellation remains a server action, but it is guarded by the shared booking domain rule: only future confirmed bookings can be cancelled.

This keeps production behavior unchanged while making UI behavior testable without mocking Supabase-backed actions.

## Client booking cancellation

Client-side booking cancellation is intentionally not implemented as broad direct table update access.

Instead, client cancellation uses the database RPC:

```txt
public.cancel_own_booking(p_booking_id uuid)
```

The RPC:

- resolves the current authenticated user through `auth.uid()`
- finds the linked `profiles.member_id`
- requires the profile role to be `client`
- updates only bookings owned by the linked member
- only allows currently `confirmed` bookings
- only allows future sessions
- updates only `bookings.status` to `cancelled`
- returns a boolean success/failure result

This keeps cancellation as a narrow, auditable operation and avoids giving clients broad update access to booking rows.

## Server/client boundary

The application follows a server-first approach.

Server-side responsibilities:

- route-level access checks
- Supabase reads
- data normalization
- filtering/sorting/counting where the result depends on URL state
- server actions
- revalidation

Client-side responsibilities:

- interactive forms using `useActionState`
- filter controls with draft state and URL updates
- mobile navigation/menu state
- cancel buttons and pending UI states
- small interactive controls where browser state is required

Large list components are kept as server-rendered/dumb UI where possible. Route pages own URL parsing and server reads, while client components own only draft filter state and URL updates.

## Performance and loading model

Performance work remains server-first and measurement-led.

Independent Dashboard summary reads execute in parallel instead of forming a sequential query waterfall. Authenticated profile resolution is cached within the React server render so layouts and pages can reuse the same role/member result without repeating the profile query.

Data-backed routes use App Router `loading.tsx` boundaries with responsive skeletons that preserve the shape of the final screen. Loading UI stays inside the existing authenticated shell, so navigation and access-control framing remain visible during route transitions.

The Dashboard has one narrower Suspense boundary around its data-dependent summary. Static Quick Actions render immediately and do not wait for the five summary reads. The full route-level Dashboard skeleton remains the initial route fallback, while the nested fallback covers only the Overview cards.

Performance verification is evidence-driven:

- production-mode Lighthouse audits are used instead of development-server scores
- React Profiler is used for targeted interactive render checks
- browser Network inspection verifies client navigation request counts
- database indexes are added only when query plans and realistic data volume justify them
- `memo`, `useMemo`, and `useCallback` are not added without a measured render problem

The current index audit found that existing indexes cover the active query shapes and that the project dataset is too small to justify speculative composite or text-search indexes. Targeted render and request audits found no actionable duplicate navigation requests or expensive avoidable rerenders.

## Discoverability model

Admin screens use discoverability only where it meaningfully improves operational usage.

### Members

The members screen uses a dedicated operations read model assembled server-side from members, profile links, and membership data.

Search across name, email, and phone; member status; linked/unlinked profile state; membership state; exact counts; and range pagination are handled in the Supabase query layer. URL search params remain the source of truth, while the client filter component owns only draft controls and navigation updates.

The same result set is rendered as a wide operations table on large screens and responsive cards below that breakpoint. Both views expose member, contact, member status, profile-link state, membership plan/state, created date, and detail/edit actions.

### Sessions

Sessions use the read-only `public.session_operations` view. It exposes trainer display data, confirmed booking count, available spots, and the derived operational status.

The route applies title search, trainer/status filters, a session-start date range, exact count, limited sorting, and range pagination in Supabase/Postgres. URL params are the applied-state source of truth; the client filter component owns draft state and navigation only.

Derived session statuses include:

- scheduled
- in progress
- full
- completed
- cancelled

### Bookings

Bookings use the read-only `public.booking_operations` view. It exposes member, session, and trainer display data together with derived booking status and `is_cancellable`.

The route applies member/session search, trainer/status filters, a session-start date range, exact count, limited sorting, and range pagination in Supabase/Postgres. Filtering and action visibility therefore use the same operational read model.

Derived booking statuses include:

- confirmed
- in progress
- completed
- cancelled

For Sessions and Bookings, sorting supports `upcoming`, `soonest`, and `latest`. `upcoming` is the default operational order: current and future actionable records are ordered by start time ascending, followed by terminal or cancelled records with newer history first. All statuses remain in the result set. The operational ordering keys are computed by the read-only database views so range pagination uses the same global order. `soonest` and `latest` remain literal timestamp sorts. `From` is inclusive, while `To` is converted to the next UTC day and applied as an exclusive boundary. One-sided ranges are valid; reversed ranges are blocked before querying. Pagination preserves active URL filters and redirects out-of-range pages to the last available page.

### Shared operations UI

Operational screens reuse domain-neutral UI primitives:

- `SingleSelect`
- `MultiSelectFilter`
- `StatusBadge`
- `OperationsFilterPanel`
- `OperationsPagination`

`SingleSelect` is the common controlled single-choice primitive used across filters and forms. `MultiSelectFilter` keeps multi-value filter behavior separate while sharing the same interactive control hierarchy.

`StatusBadge` owns only semantic presentation through neutral tones such as `success`, `info`, `warning`, `danger`, and `neutral`. Feature modules remain responsible for mapping domain statuses to those tones. This keeps domain meaning out of shared UI while giving Members, Sessions, Bookings, Trainers, Plans, Profile Links, memberships, and the client cabinet a consistent operational status language.

Shared components own generic interaction, accessibility, responsive dropdown behavior, visual control states, and pagination rendering. Feature modules keep their own domain options, status meaning, validation, layout, URL helpers, and database queries.

Native date inputs remain intentional. A custom date picker and searchable trainer combobox are outside the current scope.

## Testing strategy

Testing is treated as an MVP quality gate, not as a 100% coverage target.

Test layers:

- **Unit tests** cover pure model/domain helpers such as derived statuses and sorting logic.
- **RTL tests** cover UI contracts: forms, validation/action errors, filters, lists, auth forms, cancellation controls, profile-member linking UI, member membership management UI, and members operations pagination/filter behavior.
- **E2E tests** cover critical full-stack flows with real Supabase-backed behavior: auth/access, admin CRUD, booking creation/cancellation, client cancellation, profile-member linking, member membership assignment/cancellation, discoverability, and navigation smoke.

E2E tests use dedicated admin/client test accounts and stable fixture data. Test-created records use an `E2E ` prefix so they can be cleaned safely.

Coverage is used as a reporting snapshot, not as a metric that forces low-value tests.

## Database and migrations

Database schema is versioned under `supabase/migrations`.

Migrations document schema changes, RLS policies, triggers, indexes, and RPC functions required for the app to work. Structural database changes should be captured in migrations rather than living only in the Supabase UI or SQL Editor.

Some setup still requires manual database work, such as assigning admin roles. Client profile-to-member linking is now handled through the admin profile links workflow.

## Known limitations

The MVP intentionally does not include:

- payments or Stripe integration
- billing, invoices, checkout, or client self-purchase
- freezing/pausing memberships
- automatic membership renewal or expiration jobs
- client self-booking
- trainer portal
- advanced analytics
- light theme
- localization
- custom backend outside Supabase
- Dockerized local backend environment

Known performance characteristics:

- The app depends on Supabase as a remote BaaS, so protected server navigations include network, authentication, RLS, and query latency.
- Local production-mode Lighthouse audits across key admin and client routes produced Performance scores between 92 and 100. These are development verification results, not production monitoring data.
- Route skeletons and targeted Dashboard streaming improve perceived performance but do not remove remote server latency.
- Further optimization should be driven by measured production-like evidence rather than speculative caching, indexes, memoization, or additional client-side data infrastructure.

## Architecture principle

The project prioritizes clear ownership over abstract purity:

- route files orchestrate
- feature modules own product behavior
- model helpers own domain rules
- UI components render user-facing states
- client components are used only where interactivity requires them
- database policies/RPC protect sensitive data and mutations

The goal is a maintainable MVP that demonstrates real production thinking without overbuilding a full enterprise platform.
