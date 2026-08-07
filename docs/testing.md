# Testing Strategy

Next Level Ops uses testing as an MVP quality gate, not as a 100% coverage target.

The goal is to protect critical product behavior: auth, role boundaries, forms, filters, booking flows, cancellation, profile-member linking, member membership management, and navigation.

## Test layers

### Unit tests

Unit tests cover pure domain logic that does not need React, Supabase, or the browser.

Covered areas:

- derived booking statuses
- booking sorting
- derived session statuses
- session sorting
- Sessions/Bookings date validation and query-boundary helpers
- Sessions/Bookings canonical URL builders
- PostgREST search-filter escaping
- member membership derived statuses
- member membership date helpers
- membership cancellation eligibility
- status guards and small helpers where useful

These tests are fast and protect logic used by UI filtering, badges, counts, operational sorting, membership status rendering, and action visibility.

### React Testing Library tests

RTL tests cover user-facing UI behavior in isolation.

Covered areas:

- create/edit admin forms
- auth forms
- filters and discoverability controls
- shared operations filters, filter panel, and pagination
- Sessions/Bookings filter state, date validation, sorting, and pagination URL contracts
- member operations table/card states and indicators
- member filters and pagination URL contracts
- list empty/error states
- cancellation controls
- profile-member linking UI states and form submissions
- member membership assignment form
- member membership cancellation button
- member membership current/history states
- submitted `FormData`
- validation and action error rendering
- route-level loading-state accessibility and non-interactive skeleton contracts
- Dashboard streaming structure: summary fallback remains visible while real Quick Actions are available
- Dashboard summary-value and Quick Action link contracts

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
- admin member membership assignment/cancellation reflected in linked client cabinet
- sessions/bookings discoverability through URL params
- admin/client navigation smoke

E2E tests use dedicated admin/client test accounts and stable fixture data.

Sessions discoverability covers trainer/status/date filters, sort state, canonical URL state, visible results, reload persistence, and Reset.

Bookings discoverability covers member/session search, trainer/status/date filters, sort state, canonical URL state, visible results, reload persistence, and Reset. Existing creation and admin/client cancellation flows remain covered separately.

The suite does not create large datasets only to exercise every pagination combination through E2E; pagination contracts are covered through unit/RTL tests.

## E2E data strategy

E2E-created records use generated `E2E ... e2e-<timestamp>` names so they can be identified and cleaned safely.

Stable fixture records must not match the generated cleanup pattern and should not be removed by cleanup scripts.

Membership E2E creates fresh client/member records and uses an existing active membership plan from the catalog instead of creating new plan catalog data.

Generated E2E data can be removed through:

```bash
npm run e2e:cleanup
```

The command executes `scripts/cleanup-e2e-data.sql` against the configured Supabase PostgreSQL database

It requires:

- `E2E_DATABASE_URL`
- `E2E_ALLOW_REMOTE_CLEANUP=true`
- `E2E_CLEANUP_PROJECT_REF`

Cleanup targets only generated `E2E ... e2e-*` records. Stable `Fixture ...` records must not match the cleanup patterns and are preserved.

The SQL file remains the cleanup source of truth and can still be executed manually from the Supabase SQL Editor when required.

## E2E stability notes

Playwright runs with one worker because the suite uses a real Supabase project, shared auth test accounts, and stable fixture data.

Server-action submissions wait for Next.js hydration through the framework's test-only hydration marker. Playwright starts its own dev server with the required test environment instead of reusing an arbitrary local server.

Cancellation tests wait for deterministic UI outcomes instead of `networkidle`, because the app can keep background requests open during Supabase-backed flows.

Responsive member E2E assertions target visible content so duplicated desktop table and mobile card markup does not create ambiguous locators.

Membership E2E assertions avoid matching hidden `<option>` text from native selects. They assert visible state inside the relevant section instead.

## Performance verification

Performance checks are targeted manual verification, not timing-based automated tests.

### Lighthouse

Lighthouse is run against a production build:

```bash
npm run build
npm run start
```

Audits are performed in an Incognito window without extensions. Development-server Lighthouse results are not used as a performance baseline because development tooling, source maps, and React diagnostics distort JavaScript and main-thread metrics.

Repeated local production-mode audits across the main admin and client routes produced Performance scores between 92 and 100. These results confirm the absence of an obvious local production-mode blocker; they are not a substitute for deployed production monitoring.

### React Profiler

React Profiler is used on the development server for targeted interaction checks. It verifies render scope and component cost rather than absolute production timing.

Representative checks cover:

- Members draft filters and Apply
- Sessions draft filters, Apply, and pagination
- Bookings draft filters, Apply, and pagination

The audit found localized filter renders and no actionable expensive rerender pattern.

### Network inspection

Browser Network inspection verifies client navigation behavior:

- editing draft filter values produces no navigation request
- Apply produces one RSC navigation request
- pagination produces one RSC navigation request
- no duplicate navigation requests were observed in the checked Sessions and Bookings flows

Browser Network tools do not expose individual server-to-Supabase requests made by Server Components. Deeper query instrumentation should be added only when a measured server bottleneck justifies it.

### What is intentionally not automated

The suite does not add:

- Lighthouse score assertions
- render-duration thresholds
- request-duration thresholds
- artificial production delays
- timing-sensitive streaming E2E assertions

These checks would be environment-sensitive and prone to false failures.

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
- every membership lifecycle edge case through E2E
- implementation details
- 100% coverage

The test suite prioritizes business risk over test count.

## Principle

Use the smallest test level that can prove the behavior.

- Pure logic → unit
- UI behavior → RTL
- Real full-stack flow → E2E
