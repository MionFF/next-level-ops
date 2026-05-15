## 2026-04-23

### Route model

- `/` redirects to `/sign-in` for now
- admin area uses `/dashboard`
- client area uses `/cabinet`

Reason:

- clear public entry
- clean role-area URLs
- no role names in the URL structure

### Role model

- public sign-up creates client only
- admin is assigned manually

Reason:

- prevents privilege escalation
- keeps role control explicit

## 2026-04-24

### Supabase Auth setup

- Supabase project region: Central EU (Frankfurt)
- Email provider remains enabled
- Confirm email is disabled for MVP testing
- Public sign-up creates client users only
- Admin role will be assigned manually
- User role is stored in `public.profiles.role`
- Supabase MCP is not connected at this stage
- Supabase/Postgres agent skills are installed for Codex assistance

Reason:

- reduce auth testing friction
- avoid email delivery limits during MVP development
- keep admin access controlled
- keep database changes under direct developer control

## 2026-04-27

### Members model and admin-managed member records

- real fitness studio clients are stored in the `members` table
- authenticated user is not the same concept as member
- member represents a person who is already a client of the studio
- members are managed manually by admin for the MVP
- member records are not created automatically from sign-up
- member records are not connected to payments or product purchase flow at this stage

Reason:

- keeps the MVP focused on admin operations instead of payment/product automation
- avoids pretending that membership lifecycle automation exists before payments, plans, and purchase flows are implemented
- matches a realistic small-studio workflow where staff can manage clients manually
- keeps auth users and business members as separate domain concepts
- prevents scope creep during Milestone 3

Alternatives considered:

- automatically creating a member after public sign-up
- creating members only after payment or membership purchase
- merging authenticated users and members into one concept

Trade-offs:

- admin has to create and update members manually
- member lifecycle is not fully automated yet
- future payment/product flows may need to connect purchases, profiles, and member records

Follow-up needed:

- revisit member lifecycle automation when payments, membership plans, or product purchase flows are added
- define how client profiles connect to member records before implementing deeper client cabinet features

## 2026-05-09

### Trainers and membership plans scope

- trainers are stored as admin-managed business records in the `trainers` table
- trainer is not the same concept as authenticated user
- trainers do not have auth accounts, roles, or a trainer portal in the MVP
- membership plans are stored as reusable catalog records in the `membership_plans` table
- membership plan is not the same concept as a purchased member membership
- actual member memberships are intentionally not modeled in Milestone 4
- plan prices are stored as `price_cents` integer values
- trainer and plan detail pages are intentionally skipped
- trainer and plan delete/archive flows are intentionally skipped
- admin form logic stays feature-local for now instead of extracting reusable form abstractions

Reason:

- keeps Milestone 4 focused on admin CRUD for operational reference data
- avoids adding trainer portal, payments, purchase lifecycle, or member-plan assignment too early
- keeps auth users, trainers, members, membership plans, and future memberships as separate domain concepts
- `price_cents` avoids floating-point money issues and keeps the model compatible with payment-provider minor-unit conventions
- list/create/edit flows are enough for trainers and plans because they are supporting catalog/reference entities, not core detail-heavy records
- feature-local forms remain easier to read while fields and validation rules are still domain-specific

Alternatives considered:

- creating trainer auth accounts or a trainer role
- adding trainer and plan detail pages
- creating a `memberships` table during Milestone 4
- assigning plans to members from the member detail page
- storing plan prices as floating-point dollar values
- extracting shared admin form components immediately

Trade-offs:

- trainers cannot sign in or manage their own schedule
- plans cannot be assigned to members yet
- member detail pages cannot show active memberships yet
- some form UI and action logic is duplicated across members, trainers, and plans
- future membership lifecycle work will require a separate `memberships` model and member-plan relationship

Follow-up needed:

- revisit trainer assignment when implementing sessions
- define the `memberships` model when implementing active member subscriptions/client cabinet
- consider small shared admin form primitives only if duplication becomes painful after more flows are implemented

## 2026-05-13

### Database schema versioning

- Supabase schema is now versioned in the repository under `supabase/migrations`
- remote schema was pulled from the existing Supabase project using Supabase CLI
- future database schema changes should be tracked through migrations instead of only being applied manually in SQL Editor

Reason:

- keeps application code and required database schema in the same repository
- makes the project easier to review, reproduce, and maintain
- prepares the codebase for Milestone 5, where sessions and bookings will depend on existing tables and relationships
- improves repo hygiene and production-readiness signal

Alternatives considered:

- keeping schema only in Supabase SQL Editor
- documenting schema manually in Markdown
- postponing database versioning until packaging

Trade-offs:

- migrations require more discipline before merging DB changes
- Supabase CLI/Docker setup adds some local tooling overhead

Follow-up needed:

- use migrations for future schema changes
- avoid applying structural DB changes only through the Supabase UI unless they are later captured in migrations

## 2026-05-14

### Sessions and bookings scope

- sessions are admin-managed scheduled studio events
- each session belongs to one trainer through `sessions.trainer_id`
- bookings connect members to sessions through `bookings.member_id` and `bookings.session_id`
- bookings are admin-managed in Milestone 5
- client self-booking and client cancellation are deferred until client cabinet/member-profile linking is defined
- cancelling a booking updates `bookings.status` to `cancelled` instead of deleting the row
- cancelled bookings are kept as booking history
- session capacity stays static; occupied spots are derived from confirmed bookings count
- overbooking is prevented in server actions by checking confirmed bookings against session capacity
- duplicate active bookings are prevented with confirmed-booking checks and DB uniqueness
- past, cancelled, and unavailable sessions cannot receive new bookings
- `Completed`, `In progress`, and `Full` are UI-derived statuses, not database statuses

Reason:

- keeps Milestone 5 focused on admin operations instead of client self-service complexity
- preserves booking history instead of losing operational data through deletion
- keeps database statuses minimal and avoids storing states that can be derived from time or capacity
- keeps capacity as a business limit while deriving availability from confirmed bookings
- avoids implementing profile-to-member linking before Milestone 6
- provides realistic scheduling and booking constraints without adding unnecessary automation or background jobs

Alternatives considered:

- allowing clients to create and cancel bookings immediately
- deleting bookings when cancelled
- mutating session capacity when bookings are created or cancelled
- adding extra database statuses such as `completed`, `in_progress`, or `full`
- creating a session details page for booking management
- adding searchable comboboxes for large member/session lists during Milestone 5

Trade-offs:

- admin manages bookings manually for now
- client booking/cancellation requires a later profile-member relationship decision
- cancelled bookings remain visible and require UI distinction
- availability checks live partly in server actions instead of being fully enforced by database functions
- native select inputs are acceptable for MVP but may become inefficient with larger datasets

Follow-up needed:

- define profile-to-member linking before implementing client cabinet booking actions
- revisit searchable member/session selectors when data volume grows
- consider stronger database-level capacity enforcement if concurrent booking becomes a real risk
- improve booking/session filtering and grouping during testing and polish
