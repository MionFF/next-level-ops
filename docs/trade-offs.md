# Trade-offs

This document records the main engineering and product trade-offs in Next Level Ops.

A trade-off belongs here only when the chosen approach provides a meaningful benefit while introducing a real limitation, cost, or constraint. Routine implementation decisions, feature lists, and historical changes belong elsewhere.

## Supabase as Backend-as-a-Service

### Decision

Use Supabase for Auth, Postgres, RLS, migrations, RPC, and server-side data access instead of building a custom backend.

### Benefit

Supabase provides a production-shaped backend foundation with relatively little infrastructure work. The project can focus on product workflows, authorization, business rules, and frontend architecture instead of implementing authentication, database access, deployment, and API infrastructure from scratch.

### Cost

The application depends on an external platform and remote network calls.

This introduces:

- noticeable latency, especially on the free tier;
- dependence on Supabase availability and platform behavior;
- less backend flexibility than a fully custom service;
- slower real-backend E2E tests.

### Revisit when

Consider a custom backend only if Supabase becomes a demonstrated limitation for performance, deployment control, backend architecture, or product requirements.

---

## Admin-managed bookings instead of client self-booking

### Decision

Admins create bookings. Clients can view their bookings and cancel eligible future bookings, but cannot create bookings themselves.

### Benefit

The current booking flow keeps capacity, duplicate protection, session validity, and booking creation under one controlled operational workflow.

It avoids exposing client self-service before membership eligibility, concurrency, availability, and booking-policy rules are fully defined.

### Cost

The client role has limited agency and still depends on staff for one of the product's most important workflows.

This creates an intentionally admin-heavy product model.

### Revisit when

Client self-booking should be introduced when booking eligibility, membership rules, capacity behavior, concurrency guarantees, and cancellation policy are defined as explicit product rules.

---

## Manual membership management instead of a payment lifecycle

### Decision

Model membership plans and concrete member memberships, while keeping assignment, renewal, and cancellation admin-managed.

Payments, checkout, invoices, automatic renewal, freezing, and subscription billing are not part of the current system.

### Benefit

The application can represent a member's actual current and historical membership state without introducing financial infrastructure and payment lifecycle complexity.

The domain remains clear:

```txt
membership plan = what the studio offers
member membership = what a specific member has or had
```

### Cost

Membership state is operational rather than financial.

The system does not prove that a membership was purchased or paid for, and admins remain responsible for assigning and renewing memberships manually.

### Revisit when

Introduce payment or subscription automation only when commerce becomes a real product requirement rather than portfolio scope expansion.

---

## Database RPCs for sensitive booking mutations

### Decision

Keep security- and concurrency-sensitive booking mutations behind constrained Supabase RPCs.

This currently includes:

- admin booking creation;
- client booking cancellation.

### Benefit

Critical invariants are enforced close to the data.

For booking creation, the database can protect capacity and duplicate-booking rules under concurrent requests.

For client cancellation, the database can verify authenticated ownership and mutation eligibility without granting broad client update access to the `bookings` table.

### Cost

Business logic is split across TypeScript server actions and PostgreSQL functions.

This increases architectural complexity and means changes to booking rules may require coordinated updates across SQL, TypeScript, UI behavior, and tests.

### Revisit when

Keep using constrained RPCs for mutations that require transactional, authorization, or concurrency guarantees.

Do not move rules into SQL merely because a mutation exists; simple mutations should remain simple.

---

## Separate auth users, profiles, and members

### Decision

Model Supabase Auth users, application profiles, and studio members as separate concepts.

The ownership chain for a client is:

```txt
auth user
→ profile
→ linked member
```

### Benefit

Identity, application authorization, and studio business data have separate responsibilities and lifecycles.

A studio member does not need to be an authenticated application user, and authentication records do not need to carry the full business model.

### Cost

The model requires explicit profile-member linking and introduces additional joins, access-control rules, admin tooling, and failure states.

A broken link can make an otherwise valid client account unable to resolve its studio member data.

### Revisit when

Keep the separation unless the product model fundamentally changes.

Improve lifecycle and linking tooling rather than collapsing the concepts into one table purely to reduce complexity.

---

## Derived operational statuses instead of storing every state

### Decision

Derive time- and relationship-dependent states instead of persisting all of them as database status values.

Examples include:

- session `in_progress`;
- session `completed`;
- session `full`;
- booking `in_progress`;
- booking `completed`;
- membership `expired`.

### Benefit

Derived states automatically change as time and related data change.

The system avoids background jobs whose only purpose would be to keep stored status fields synchronized with reality.

### Cost

The same business meaning must remain consistent across database views, TypeScript helpers, UI badges, filters, and mutation eligibility.

Time-dependent behavior also makes these states more complex than simple persisted enums.

### Revisit when

If status logic grows substantially, consolidate more of the read-side derivation into a single authoritative database or domain layer.

Do not persist derived states unless there is a demonstrated reason to do so.

---

## Database operations views with exact-count offset pagination

### Decision

Use read-only operations views for Members, Sessions, and Bookings, with filtering, exact counts, stable sorting, and range pagination performed in Supabase/Postgres.

### Benefit

Operational pages do not need to load entire datasets into application memory.

The database owns filtering and pagination, while views keep joined display data and derived operational state aligned across:

- result rows;
- filters;
- counts;
- badges;
- action eligibility.

### Cost

Paginated routes usually perform both a count query and a data query.

The operations views become explicit read-model contracts that must evolve with the application.

Offset/range pagination can also become inefficient at very large offsets.

### Revisit when

Keep the current model while datasets remain moderate.

Consider cursor pagination, different count strategies, or additional query optimization only after measured database volume or query plans show a real problem.

---

## Real Supabase E2E tests instead of mocked full-stack tests

### Decision

Run Playwright E2E tests against real Supabase-backed application flows rather than replacing Auth, RLS, RPC, and database behavior with mocks.

The suite runs with one worker because tests share a remote Supabase project, test accounts, and fixture data.

### Benefit

E2E tests verify the boundaries most likely to fail in production:

- authentication;
- authorization;
- server actions;
- RLS;
- RPC behavior;
- database mutations;
- real navigation across server-rendered routes.

A mocked backend would provide faster tests but substantially weaker confidence in these flows.

### Cost

The suite is slower and more sensitive to remote latency and network instability.

It also requires:

- dedicated credentials;
- stable fixture data;
- generated test-data conventions;
- cleanup of created entities;
- serialized execution.

Generated E2E data is therefore cleaned through the explicit `npm run e2e:cleanup` workflow instead of assuming test isolation that the current infrastructure does not provide.

### Revisit when

Parallelize or further isolate the suite only when the test environment supports independent data ownership per worker or per run.

A local or ephemeral Supabase environment would reduce remote-network flakiness, but it should be introduced only if the infrastructure cost becomes justified.
