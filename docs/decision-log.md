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
