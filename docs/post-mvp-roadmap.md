# Next Level Ops — Post-MVP Roadmap

## Milestone 0 — Post-MVP baseline

- add this post-MVP roadmap
- sync outdated route documentation
- document post-MVP priorities
- keep the MVP roadmap as historical context
- avoid feature work in this milestone

## Milestone 1 — Profile access-control hardening

- remove or restrict broad own-profile update access
- prevent users from self-updating sensitive profile fields
- protect `profiles.role` from self-assignment
- protect `profiles.member_id` from self-linking
- keep own-profile read access
- add verification for client privilege-escalation prevention
- update architecture/trade-off notes

## Milestone 2 — Booking business invariants

- align admin cancellation server rules with derived booking status rules
- prevent invalid admin cancellation paths
- review booking capacity checks
- consider moving booking creation invariants into a constrained RPC
- preserve duplicate confirmed booking protection
- add tests for invalid cancellation and capacity-related behavior
- document booking invariant decisions

## Milestone 3 — Profile-member linking workflow

- add admin UI for unlinked client profiles
- add admin UI for unlinked members
- add safe admin-only link action
- add safe admin-only unlink action
- preserve one-profile-to-one-member constraint
- keep client unlinked state clear and recoverable
- cover linking flow with tests

## Milestone 4 — Member membership management

- add admin membership assignment flow
- show active membership on member detail
- show membership history on member detail
- add membership cancellation flow
- add membership renewal flow
- derive expired membership state from dates
- keep payments and automated billing out of scope
- update client cabinet membership behavior where needed

## Milestone 5 — Members operations table

- add server-side pagination
- expand search to name, email, and phone
- add linked/unlinked filter
- add membership status filter
- show profile-linking and membership indicators
- preserve URL-driven state
- preserve responsive desktop table and mobile card views
- add tests for new filters and pagination

## Milestone 6 — Sessions and bookings scalability

- add pagination for sessions and bookings
- add operational date-range filters where useful
- move filtering closer to database queries where practical
- reduce unnecessary full-list loading
- narrow selected fields where possible
- keep derived status logic centralized
- preserve URL-driven discoverability
- update E2E coverage for key flows

## Milestone 7 — Dashboard performance and loading

- parallelize independent dashboard summary reads
- review indexes for post-MVP filters
- add route-level loading states where useful
- add skeleton UI for slower operational blocks
- use Suspense only for independent data blocks
- document performance trade-offs
- avoid adding client-side data libraries without a clear need

## Milestone 8 — Post-MVP packaging refresh

- update README feature list
- update architecture notes
- update trade-offs
- update decision log
- refresh screenshots or demo notes if needed
- verify `npm run quality`
- verify `npm run e2e`
- keep the project presentation aligned with the hardened post-MVP state
