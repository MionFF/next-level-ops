# Trade-offs

Next Level Ops is an MVP, not a full enterprise platform.  
This document records the main engineering and product trade-offs made during development.

## Supabase as Backend-as-a-Service

### Decision

Use Supabase for Auth, Postgres, RLS, migrations, RPC, and server-side data access.

### Reason

Supabase allowed the project to reach a full-stack MVP level without building a custom backend, auth system, database layer, and access-control infrastructure from scratch.

### Trade-off

The app depends on a remote BaaS and can suffer from latency, especially on the free tier and during development/E2E flows.

### Future improvement

If performance or backend flexibility becomes a blocker, the backend could be migrated to a custom API with PostgreSQL, Docker, and a dedicated auth/access layer.

## Admin-managed bookings instead of client self-booking

### Decision

Bookings are created by admins. Clients can view and cancel their own future bookings, but cannot create bookings themselves.

### Reason

Client self-booking requires stronger rules around availability, capacity, membership eligibility, duplicate bookings, race conditions, and possibly waitlists.

### Trade-off

The client cabinet is useful but limited. Clients still depend on staff for booking creation.

### Future improvement

Add client self-booking only after eligibility, availability, capacity, and concurrency rules are clearly defined.

## No payments or Stripe in MVP

### Decision

Membership plans and member memberships are modeled, but payments, Stripe, invoices, renewals, and purchase flows are out of scope.

### Reason

The MVP focuses on studio operations, not commerce automation.

### Trade-off

Membership assignment is manual and does not represent a real paid subscription lifecycle.

### Future improvement

Add payments only after the operational model is stable.

## Manual role and profile-member linking

### Decision

Admin role assignment and client profile-to-member linking are handled manually for the MVP.

### Reason

This prevents privilege escalation and avoids building internal admin tooling too early.

### Trade-off

Some setup work requires Supabase SQL Editor or manual database updates.

### Future improvement

Add admin UI for linking profiles to members and managing user roles safely.

## Auth user, profile, and member are separate concepts

### Decision

Supabase auth users, app profiles, and studio members are modeled separately.

### Reason

An authenticated user is an identity, a profile is an app-level access record, and a member is a business record inside the fitness studio.

### Trade-off

The data model is more complex than merging everything into one user table.

### Future improvement

Keep this separation, but improve admin tooling around linking and lifecycle management.

## RPC for client booking cancellation

### Decision

Client booking cancellation uses a constrained database RPC instead of direct client table updates.

### Reason

The RPC resolves the authenticated user, checks the linked member, verifies booking ownership, requires a confirmed future booking, and only updates `bookings.status`.

### Trade-off

Cancellation rules are split between server action flow and database RPC.

### Future improvement

Keep sensitive mutations behind explicit database functions when they need stronger guarantees.

## Derived statuses instead of storing every state

### Decision

Statuses like `Completed`, `In progress`, and `Full` are derived from time, capacity, and confirmed bookings instead of stored directly in the database.

### Reason

These states can change naturally over time and do not need manual updates or background jobs.

### Trade-off

UI and filtering logic must compute derived statuses consistently.

### Future improvement

If the app grows, centralize more derived-state logic at the database or service layer.

## Server-first architecture with isolated client islands

### Decision

Pages and layouts stay server-first. Client components are used only for interactive forms, filters, menus, and pending UI states.

### Reason

This matches Next.js App Router strengths and keeps data loading, access checks, and filtering close to the server.

### Trade-off

Some UI interactions require explicit client boundaries and careful prop design.

### Future improvement

Keep client components small and avoid moving whole screens to the client unless browser state truly requires it.

## Optional action props for form testability

### Decision

Form components accept optional `action` props for tests while using real server actions by default in production.

### Reason

This makes form UI testable without mocking Supabase-backed server actions or rewriting all forms into container/presentational pairs.

### Trade-off

Form component APIs are slightly wider.

### Future improvement

If forms grow more complex, consider a cleaner container/presentational split.

## Real Supabase E2E tests

### Decision

E2E tests use real Supabase-backed flows instead of mocking the backend.

### Reason

The highest-risk behavior depends on auth, server actions, RLS, RPC, and database state. Mocked E2E would not prove those flows.

### Trade-off

E2E tests are slower, require environment setup, and depend on stable test accounts and fixture data.

### Future improvement

Automate cleanup and fixture setup if manual SQL cleanup becomes painful.

## Single-worker Playwright

### Decision

Playwright runs with one worker.

### Reason

E2E tests share a real Supabase project, auth accounts, and stable fixture data.

### Trade-off

The E2E suite is slower.

### Future improvement

Parallelize only after test data isolation becomes strong enough.

## Responsive dashboard baseline instead of native mobile app

### Decision

The MVP supports responsive layouts, mobile navigation, and usable mobile screens, but does not aim to be a native mobile-first product.

### Reason

The core product is an operations dashboard, primarily used on desktop/tablet-like workflows.

### Trade-off

Mobile UX is usable but intentionally not as rich as a dedicated mobile app.

### Future improvement

Add deeper mobile UX or React Native only if the product direction requires it.

## Limited analytics

### Decision

The admin dashboard provides an operational overview, but not advanced analytics, charts, forecasting, or reporting.

### Reason

The MVP prioritizes CRUD, bookings, roles, access, cancellation, and discoverability.

### Trade-off

The dashboard is useful but not a full business intelligence tool.

### Future improvement

Add analytics after core operational workflows are stable.

## No localization or theme switching

### Decision

The MVP uses English UI copy and a dark visual direction.

### Reason

Localization and multi-theme support would add extra design and testing surface area before the core product is fully packaged.

### Trade-off

The app is less flexible for multi-language or light-theme users.

### Future improvement

Add localization and theme switching after the MVP is stable.
