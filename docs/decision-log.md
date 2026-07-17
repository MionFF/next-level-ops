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

## 2026-05-17

### Client cabinet, linked member model, and safe cancellation

- Milestone 6 implements the client cabinet for authenticated client users linked to existing studio member records.
- Client auth profiles are linked to business member records through `profiles.member_id`.
- The cabinet resolves client data through `auth.uid() -> profiles.id -> profiles.member_id -> members.id`.
- `member_memberships` was introduced to represent concrete member-plan assignments.
- `membership_plans` remain reusable catalog records, while `member_memberships` represent actual memberships for specific members.
- Clients can view their linked member info, active membership, upcoming bookings, and booking history summary.
- Clients can cancel their own confirmed future bookings.
- Client self-booking remains out of scope for the MVP.
- Cancelled bookings are not deleted; they remain part of booking history.
- Client cancellation is handled through `public.cancel_own_booking(p_booking_id uuid)`.
- Direct client `UPDATE` access to `public.bookings` is not allowed.
- The RPC resolves the current member through `auth.uid()` and `profiles.member_id`.
- The RPC updates only `bookings.status` to `cancelled`.

Reason:

- Keeps Milestone 6 focused on a secure client-facing cabinet over existing operational data.
- Preserves the MVP model where booking creation is admin-managed.
- Avoids expanding the cabinet into a full client self-booking platform.
- Separates auth users from business member records.
- Adds realistic multi-role product behavior without introducing payments or full membership lifecycle automation.
- Prevents clients from mutating non-status booking columns through the public Supabase API.
- Keeps cancellation as a narrow, auditable database operation.
- Preserves operational history by keeping cancelled booking records.

Alternatives considered:

- Allowing clients to create bookings themselves.
- Allowing direct client `UPDATE` through RLS.
- Tightening the `WITH CHECK` policy to preserve immutable booking columns.
- Handling cancellation only in the server action with direct table update.
- Merging auth profiles and members into one domain concept.
- Storing active memberships directly on `members` instead of using `member_memberships`.

Trade-offs:

- Clients can cancel existing bookings but cannot create new ones.
- Admin remains responsible for booking creation in the MVP.
- Client cabinet depends on linking `profiles.member_id`.
- Manual profile-member linking is acceptable for MVP but may need admin UI later.
- Cancellation now depends on a database RPC.
- Future cancellation rule changes must update the RPC.

Follow-up needed:

- Add tests for client cabinet and cancellation flow during Milestone 7.
- Consider admin UI for linking profiles to members if manual linking becomes painful.
- Revisit client self-booking after MVP only if eligibility, availability, capacity, and concurrency rules are clearly defined.
- Document the client cancellation flow in architecture notes.

## 2026-05-18 — 2026-05-21

### Milestone 7A stabilization before testing

- Milestone 7 starts with stabilization before testing.
- Test setup is deferred until the implemented MVP flows are stable enough to test.
- `/forbidden` is upgraded from placeholder to usable access-denied recovery page.
- `/dashboard` is upgraded from placeholder to operational admin overview.
- Admin/client shell navigation receives active states.
- Desktop shell navigation remains sticky.
- Mobile shell uses a compact sticky header and full-screen navigation overlay.
- Performance optimization is not handled blindly in Milestone 7A; Supabase/network timeout concerns remain tracked separately.

Reason:

- Tests should lock stable product behavior, not obvious UX gaps.
- `/dashboard`, `/forbidden`, and shell navigation are core product surfaces.
- Navigation clarity and recovery paths are baseline MVP requirements.
- Stabilization must improve product quality without expanding feature scope.

Trade-offs:

- Testing starts later than originally planned.
- Shell navigation now includes small client components for pathname state and mobile menu behavior.
- Some UI polish is handled before test infrastructure.

Follow-up needed:

- Add Jest/RTL and Playwright in Milestone 7B.
- Include protected flows, role redirects, admin CRUD, client cabinet, and cancellation behavior in test coverage.

### Responsive UI strategy

- The app must be usable on mobile and tablet, not only desktop.
- Desktop admin list screens keep tables at `lg+`.
- Mobile/tablet admin and cabinet list screens use card lists below `lg`.
- Horizontal table scrolling is not used as the primary mobile UX.
- Dense list screens use overflow-safe handling for long names, titles, descriptions, emails, and related labels.
- Mobile forms, details, cabinet sections, and list wrappers use lighter visual framing to avoid nested-card clutter.
- Shell min-height behavior is adjusted to avoid empty mobile scroll caused by mobile header + full-screen containers.
- Responsive list/card implementations stay feature-local for now instead of extracting shared abstractions.

Reason:

- Before this pass, the MVP was effectively not usable on mobile.
- Tables work well on desktop but are a poor primary representation on narrow screens.
- Card lists expose decision-useful data more clearly on mobile.
- Real-world long content must not be able to break layouts.
- Feature-local duplication is acceptable while the responsive pattern is still stabilizing.

Trade-offs:

- Desktop and mobile list presentations must be kept consistent manually.
- Some UI markup is duplicated between table rows and mobile cards.
- Shared responsive primitives are deferred to avoid premature abstraction.

Follow-up needed:

- Add responsive smoke coverage where practical.
- Consider extracting shared list/card primitives only if duplication becomes painful.

### Text overflow and input length limits

- Desktop tables receive controlled text overflow handling.
- Long names, titles, descriptions, emails, and related labels are clamped or truncated.
- Metadata fields such as dates, prices, statuses, phones, capacity, and actions are protected from awkward wrapping.
- Form schemas now enforce reasonable text length limits for key fields.
- Text length limits are enforced in Zod schemas only.
- No new database migration is added for text length constraints during this pass.

Reason:

- Long user/content values were able to deform table layouts.
- UI should be resilient against realistic and pathological input.
- Schema-level limits are enough for the current MVP because writes go through app forms/server actions.
- DB constraints would add migration scope without being necessary for this stabilization pass.

Trade-offs:

- Database still does not enforce these text limits directly.
- Direct database writes could bypass app-level validation.
- UI still needs defensive overflow handling even with form limits.

Follow-up needed:

- Revisit DB-level text constraints only if external writes, imports, or public APIs are added.

### Sessions and bookings discoverability

- Sessions and bookings receive discoverability improvements.
- Filtering is server-driven through URL search params.
- Bookings support filtering/searching by operationally useful fields such as member, email, session title, and status.
- Sessions support filtering/searching by operationally useful fields such as title, trainer, and status.
- Status filters use multi-select dropdown UI.
- Derived session/booking statuses are centralized in model helpers.
- Derived statuses are reused for badges, sorting, filtering, counts, and action visibility.
- Filter components own only isolated client interactivity.
- List components remain server-rendered display components over already-filtered data.
- Trainers and plans intentionally remain simple during this stabilization pass.

Reason:

- Sessions and bookings are the highest-volume operational screens.
- Admin needs fast scanning and filtering before the MVP is presentable.
- URL state keeps filters reload-safe, shareable, and aligned with App Router server rendering.
- Centralized derived-status logic prevents drift between UI labels, counts, sorting, filtering, and actions.
- Adding the same discoverability depth to every screen would exceed MVP stabilization scope.

Trade-offs:

- Filter UI is more complex than simple native selects.
- Multi-select dropdowns require client state and accessibility handling.
- Server orchestration is more involved than unfiltered list fetching.
- Derived-status helpers become a central dependency for these screens.

Follow-up needed:

- Cover sessions/bookings filter flows in Milestone 7B tests.
- Keep trainers/plans simple unless real discoverability pain appears.
- Avoid extracting a generic filter framework until reuse pressure is clear.

### Booking cancellation action visibility

- Admin booking cancellation action is shown only when the booking derived status is `confirmed`.
- Bookings with derived statuses such as `completed`, `in_progress`, or `cancelled` show `—` instead of `Cancel`.
- UI action visibility no longer relies only on stored `bookings.status === 'confirmed'`.
- Client cabinet cancellation behavior remains unchanged and limited to upcoming bookings.

Reason:

- A stored confirmed booking can become completed or in progress based on session time.
- Completed or running bookings should not expose a cancellation action.
- Derived status better represents the current operational state than stored booking status alone.
- This preserves the minimal database status model without adding `completed` or `in_progress` as stored booking statuses.

Trade-offs:

- Cancel action visibility now depends on derived-status logic.
- Future changes to derived-status rules can affect action availability.
- Server-side cancellation rules must stay aligned with UI cancellability.

Follow-up needed:

- Add tests for completed and in-progress bookings not exposing cancellation.
- Verify server-side cancellation does not allow invalid cancellation paths during Milestone 7B.

## 2026-05-21 — 2026-05-26

### Milestone 7B testing strategy and quality gate

- Milestone 7B adds a pragmatic MVP quality gate instead of chasing 100% test coverage.
- Test coverage focuses on critical product paths, role boundaries, destructive flows, and high-risk business logic.
- Unit tests cover pure model/domain helpers once, including derived statuses and sorting logic for sessions and bookings.
- Logic covered at the unit layer is not repeatedly re-tested through RTL unless user-visible behavior requires it.
- RTL tests focus on isolated UI contracts: form rendering, submitted `FormData`, validation/action errors, filters, list states, cancellation controls, and auth form UI behavior.
- RTL tests intentionally avoid Supabase auth, protected routing, RLS, cookies, and implementation details.
- Form components expose server actions through optional `action` props to make client UI behavior testable without changing production behavior.
- Shared RTL test helpers are allowed when duplication becomes painful, such as extracting submitted `FormData`.
- E2E tests complement RTL tests; they do not replace lower-level tests.
- E2E tests cover real auth, protected role-based routes, server actions, Supabase mutations, RLS/RPC-sensitive flows, URL search params, and cross-role cancellation behavior.
- E2E tests intentionally cover only the most valuable flows:
  - auth/access boundaries
  - admin member create/edit/filter flow
  - admin trainer/member/session/booking creation flow
  - admin booking cancellation
  - client own-booking cancellation
  - sessions/bookings discoverability through URL params
  - admin/client navigation smoke
- Not every component, validation branch, filter combination, class name, or CRUD path is covered by E2E.
- Dedicated E2E admin and client auth accounts are used for Playwright tests.
- E2E credentials are stored in `.env.local` and documented as empty keys in `.env.example`.
- The E2E client account is linked to a stable `Fixture Client Member` through `profiles.member_id`.
- E2E-created data uses the `E2E ` prefix so test records can be identified and cleaned safely.
- Stable fixtures use the `Fixture ` prefix and must not be removed by cleanup scripts.
- E2E tests create real trainers, members, sessions, and bookings through the UI instead of mocking Supabase.
- A manual SQL cleanup script is kept in `scripts/cleanup-e2e-data.sql` and should be run from Supabase SQL Editor when test data cleanup is needed.
- Cleanup targets `E2E ` records only and must not unlink or delete stable fixture records.
- Playwright is configured to run with one worker because tests share a real Supabase project and stable auth fixtures.
- Playwright browser installation is limited to Chromium for the MVP testing stage.
- Coverage is used as a snapshot/reporting tool, not as a target that forces low-value tests.

Reason:

- Provides a strong hiring-grade quality signal without turning the portfolio project into a test-count exercise.
- Keeps tests focused on production risk: auth, roles, server actions, RLS/RPC-sensitive mutations, CRUD, filters, cancellation, and routing.
- Keeps form UI testable without mocking Supabase-backed server actions or changing production behavior.
- Avoids brittle tests that duplicate implementation details or assert styling instead of behavior.
- Keeps the testing suite maintainable for a solo developer while still proving full-stack behavior.
- Preserves clear separation between fast RTL/unit confidence and slower realistic E2E confidence.
- Allows real Supabase-backed E2E flows without polluting the database permanently.
- Protects stable client fixture data from cleanup mistakes.
- Keeps E2E runtime predictable and reduces flakes caused by parallel access to shared auth users and database state.

Alternatives considered:

- Chasing 100% test coverage.
- Testing every UI component and every class name.
- Testing every form validation branch through E2E.
- Mocking Supabase in E2E.
- Using generated fixture records without cleanup conventions.
- Using permanent fixture trainers/members for all admin E2E flows.
- Running Playwright tests in parallel workers.
- Adding Cypress or an additional test runner.
- Adding MSW before a clear need existed.

Trade-offs:

- Some lower-risk UI branches remain untested.
- E2E tests depend on a real Supabase project and stable test users.
- E2E tests are slower than RTL and require environment setup.
- Form component APIs are slightly wider because test actions can be injected, but this avoids a larger container/presentational refactor during the MVP stage.
- Cleanup is manual through SQL Editor for now.
- Stable fixture data must be protected by naming conventions.
- Playwright runs serially, so the E2E suite is slower but more reliable.
- The suite proves critical behavior, not exhaustive correctness of every possible state.

Follow-up needed:

- Run `npm run quality` and `npm run e2e` before merging testing changes.
- Run `npm run test:coverage` when a coverage snapshot is useful.
- Keep `/coverage` ignored and exclude generated coverage output from ESLint.
- Run the E2E cleanup SQL script manually when test data accumulates.
- Revisit automated cleanup only if manual SQL cleanup becomes painful.
- Keep future tests focused on critical behavior, not coverage inflation.

## 2026-06-25

### Post-MVP hardening arc

- MVP is complete.
- The project is moving into a post-MVP hardening arc.
- `docs/roadmap.md` remains the historical MVP roadmap.
- `docs/post-mvp-roadmap.md` becomes the current execution roadmap.
- Milestone 0 is limited to documentation alignment and does not change product behavior.

Reason:

- The next phase should be driven by production priorities instead of ad hoc feature work.
- Access-control boundaries, business invariants, manual MVP workflows, operational scalability, loading/performance, and final packaging need a clear sequence.
- Keeping MVP and post-MVP roadmaps separate prevents documentation drift and scope confusion.

Trade-offs:

- No runtime behavior changes are included in this milestone.
- Feature work is intentionally deferred until the baseline documentation contract is merged.

Follow-up needed:

- Start Milestone 1 only after this baseline PR is merged.
- Use the post-MVP roadmap as the execution contract for the next PRs.

## 2026-06-26

### Profile access-control hardening

- Replaced the broad `Users can update own profile` policy with a narrower own-profile update policy.
- Authenticated users may update only their own `full_name`.
- Authenticated users cannot self-update `profiles.role`.
- Authenticated users cannot self-update `profiles.member_id`.
- Own-profile read access remains available.
- Role assignment and profile-member linking remain system/admin-controlled.

Reason:

- `profiles.role` controls access to admin/client areas.
- `profiles.member_id` controls client ownership of member, membership, booking, session, trainer, and plan data.
- These fields are access-control boundaries and must not be client-controlled.

Trade-offs:

- The app does not add profile editing UI in this milestone.
- Admin role assignment and profile-member linking remain manual/admin-controlled until later milestones.
- This milestone hardens the database boundary without expanding product behavior.

Follow-up needed:

- Implement admin-controlled profile-member linking in the dedicated post-MVP milestone.
- Keep future profile editing limited to safe self-service fields unless explicitly reviewed.

## 2026-06-26

### Booking business invariants hardening

- Moved admin booking creation invariants into a constrained Supabase RPC: `public.create_admin_booking`.
- The RPC checks that the caller is an authenticated admin.
- The RPC validates that the session exists, the member exists, the session is not cancelled, and the session is still in the future.
- The RPC enforces capacity before insert and prevents duplicate confirmed bookings for the same member/session pair.
- Booking creation is serialized per session row with `FOR UPDATE` to avoid the `count confirmed -> insert` race window.
- Admin booking cancellation now checks that a booking is both confirmed and linked to a future session before allowing cancellation.

Reason:

- Booking capacity and duplicate prevention are business invariants, not just UI/server-action conveniences.
- Admin cancellation must not rely only on UI-derived booking status.
- The database-backed workflow keeps critical booking creation rules close to the data.

Trade-offs:

- `createBooking` server action now orchestrates form validation, auth guard, RPC call, message mapping, revalidation, and redirect.
- Admin cancellation remains a server action guarded by a shared domain helper.
- No client self-booking, waitlists, payments, or new booking statuses were added.

Follow-up needed:

- Keep future booking lifecycle changes aligned between UI, server actions, and RPC/database rules.

## 2026-07-03

### Profile-member linking workflow

- Added `/dashboard/profile-links` as the admin workflow for managing client profile-to-member links.
- The page shows unlinked client profiles, unlinked members, and current linked pairs.
- Admins can link one client profile to one available member.
- Admins can unlink an existing profile-member pair.
- Linking and unlinking use constrained Supabase RPCs:
  - `public.link_profile_to_member(p_profile_id uuid, p_member_id uuid)`
  - `public.unlink_profile_from_member(p_profile_id uuid)`
- The RPCs update only `public.profiles.member_id`.
- Direct broad profile updates remain unavailable for access-control fields.
- Client self-linking, invite flows, Auth Admin API user lookup, profile creation, member creation, search, pagination, and advanced CRM behavior are out of scope.
- The client cabinet continues to render an unlinked state when `profiles.member_id` is missing.
- The workflow is covered by RTL and Playwright E2E tests.

Reason:

- `profiles.member_id` controls the client cabinet ownership chain.
- Manual SQL linking was an MVP setup cost and a post-MVP operational blocker.
- Linking must be admin-controlled because a client must not be able to attach their profile to arbitrary member data.
- A constrained RPC keeps the mutation narrow and auditable without granting broad update access to `public.profiles`.
- A dedicated page keeps the workflow explicit instead of overloading the members screen.

Alternatives considered:

- Keep profile-member linking manual in Supabase SQL Editor.
- Let clients self-link to member records.
- Add profile linking directly to the members page.
- Build a broader user-management or invite system.
- Use Supabase Auth Admin API for email-based user lookup.
- Add search, pagination, or profile/member creation inside the linking page.

Trade-offs:

- Admins now have a real internal workflow for linking profiles to members.
- The workflow uses simple native selects and overview sections instead of advanced searchable controls.
- The page loads current profiles and members for a small operational dataset.
- Larger datasets may need search, pagination, or member/profile indicators later.
- Admin role assignment remains manual.

Follow-up needed:

- Surface linked/unlinked indicators in the members operations table during the members table milestone.
- Revisit search/pagination for profile links only if data volume makes native selects painful.
- Keep future user-management work separate from the profile-member linking boundary.

## 2026-07-06

### Member membership management

- Added admin-managed membership assignment and cancellation from `/dashboard/members/[memberId]`.
- Kept `membership_plans` as the reusable plan catalog.
- Used `member_memberships` for concrete member-plan assignments.
- The member detail page now shows current membership and membership history.
- Membership history includes active, upcoming, expired, and cancelled UI states.
- Stored membership statuses remain limited to `active` and `cancelled`.
- `expired` is derived from `ends_at` and is not written to the database.
- Membership assignment uses a server action and existing admin RLS access.
- No new RPC was added for member membership assignment.
- Assignment validates admin access, member existence, active plan existence, non-past start date, calculated end date, and non-overlapping active membership periods.
- Renewing a membership uses the same assignment flow with a default start date based on the current membership end date.
- Cancelling a membership updates `member_memberships.status` to `cancelled` and preserves the row in history.
- Client cabinet reflects the linked member's active membership after admin assignment/cancellation.
- Payments, billing, invoices, checkout, discounts, freezing, automatic renewal, and client self-purchase remain out of scope.
- Added unit/RTL coverage for membership model helpers, assignment form, cancellation button, membership section states, and action visibility.
- Added Playwright coverage for the cross-role flow: admin assigns membership, linked client sees active membership, admin cancels membership, linked client sees no active membership.

Reason:

- `membership_plans` are catalog/reference data, not assigned memberships.
- Admins need to manage a specific member's membership lifecycle from the member detail page.
- The member detail page matches the operational mental model: open a member, manage that member's membership.
- `member_memberships` is a normal admin-managed business entity, unlike `profiles.member_id`, which is an access-control field.
- Existing admin RLS and server actions are sufficient for this workflow.
- Keeping `expired` derived avoids unnecessary background jobs or stored state drift.
- Manual assignment/cancellation strengthens the product without expanding into payments or subscription automation.

Alternatives considered:

- Creating a separate `/dashboard/memberships` page.
- Managing assigned memberships from the plans page.
- Adding a Supabase RPC for assignment/cancellation.
- Writing expired status back to the database.
- Allowing admins to create already-expired memberships by assigning past start dates.
- Adding payments, checkout, invoices, freezing, or automatic renewal.
- Adding client self-purchase.

Trade-offs:

- Admins can manage memberships operationally, but the app still does not automate billing or subscriptions.
- Membership expiration is derived at render/query time instead of being materialized in the database.
- Server actions hold the current assignment/cancellation workflow rather than delegating to RPC.
- Overlap protection is enforced in the server action for the current admin-managed flow.
- Native selects and compact forms are acceptable for the current dataset size.

Follow-up needed:

- Keep future membership lifecycle changes aligned between member detail UI, server actions, client cabinet reads, and tests.
- Consider deeper lifecycle automation only if payment/subscription scope is explicitly added.
- Revisit stronger database-level invariants only if membership assignment becomes multi-channel or concurrent enough to justify it.

## 2026-07-11 — 2026-07-17

### Members operations read model and scalable list workflow

- Replaced the members full-list workflow with a server-side operations read model.
- Search now covers member name, email, and phone.
- Member status, profile-link state, and membership state are URL-driven filters.
- Exact counts and page ranges are handled in the Supabase query layer.
- The list shows profile-link and membership indicators in a desktop operations table and responsive card view.
- Filter, list, and pagination behavior is covered with RTL tests; critical member flows remain covered by Playwright.
- Server-action E2E submissions wait for Next.js hydration through the framework's test-only marker, and Playwright always starts the server with that environment.

Reason:

- Member operations need database-side filtering and pagination before dataset growth makes full-list loading a blocker.
- URL state keeps operational views reload-safe, shareable, and server-rendered.
- A dedicated read model avoids pushing cross-entity operational assembly into the client.
- Hydration-aware E2E synchronization prevents native form submissions before Server Actions are attached.

Trade-offs:

- The members query is more complex because it combines operational data from members, profile links, and memberships.
- Desktop and responsive card markup duplicate presentation and must remain behaviorally aligned.
- E2E readiness depends on a Next.js test-only hydration marker, so framework upgrades must keep this helper under review.
- Playwright cannot reuse an arbitrary local dev server because the test environment must be deterministic.

Follow-up needed:

- Apply the same database-side scalability principles to sessions and bookings in Milestone 6.
- Revisit shared responsive primitives only if duplication becomes a recurring maintenance cost.
