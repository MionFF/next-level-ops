# Testing Strategy

Next Level Ops uses testing as an MVP quality gate, not as a 100% coverage target.

The goal is to protect critical product behavior: auth, role boundaries, forms, filters, booking flows, cancellation, profile-member linking, and navigation.

## Test layers

### Unit tests

Unit tests cover pure domain logic that does not need React, Supabase, or the browser.

Covered areas:

- derived booking statuses
- booking sorting
- derived session statuses
- session sorting
- status guards and small helpers where useful

These tests are fast and protect logic used by UI filtering, badges, counts, and operational sorting.

### React Testing Library tests

RTL tests cover user-facing UI behavior in isolation.

Covered areas:

- create/edit admin forms
- auth forms
- filters and discoverability controls
- list empty/error states
- cancellation controls
- profile-member linking UI states and form submissions
- submitted `FormData`
- validation and action error rendering

RTL tests intentionally avoid Supabase, cookies, protected routing, and implementation details.

Form components expose optional `action` props for test injection. Production behavior still uses the real server actions by default.

### Playwright E2E tests

E2E tests cover the most valuable full-stack flows with real Supabase-backed behavior.

Covered flows:

- auth and protected route access
- admin member create/edit/filter flow
- admin trainer/member/session/booking creation flow
- admin booking cancellation
- client cabinet access
- client own-booking cancellation
- admin profile-member linking and unlinking
- sessions/bookings discoverability through URL params
- admin/client navigation smoke

E2E tests use dedicated admin/client test accounts and stable fixture data.

## E2E data strategy

E2E-created records use generated `E2E ... e2e-<timestamp>` names so they can be identified and cleaned safely.

Stable fixture records must not match the generated cleanup pattern and should not be removed by cleanup scripts.

Cleanup is handled manually through `scripts/cleanup-e2e-data.sql` when test data accumulates.

## E2E stability notes

Playwright runs with one worker because the suite uses a real Supabase project, shared auth test accounts, and stable fixture data.

E2E helpers wait for app readiness before submitting server-action forms. This avoids clicking submit before the Next.js client router/action layer is ready during cold starts or dev-server reloads.

Cancellation tests wait for deterministic UI outcomes instead of `networkidle`, because the app can keep background requests open during Supabase-backed flows.

## Commands

```bash
npm run test
npm run test:coverage
npm run e2e
npm run e2e:ui
npm run quality
```

`npm run quality` runs lint, unit/RTL tests, and production build.

Playwright runs separately because it depends on real Supabase test accounts and environment setup.

## What is intentionally not tested

The suite does not try to cover:

- every class name
- every visual detail
- every validation branch through E2E
- every CRUD variation
- implementation details
- 100% coverage

The test suite prioritizes business risk over test count.

## Principle

Use the smallest test level that can prove the behavior.

- Pure logic → unit
- UI behavior → RTL
- Real full-stack flow → E2E
