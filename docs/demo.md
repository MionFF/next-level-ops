# Demo Instructions

## Hosted demo

Hosted demo:

```txt
https://next-level-ops.vercel.app
```

Demo credentials are available on request.
The repository does not contain demo credentials.

The hosted demo uses a real Supabase backend with demo accounts and demo data.

## Demo roles

### Admin

Use the admin demo account to review:

- dashboard overview
- members
- trainers
- membership plans
- sessions
- bookings
- sessions/bookings filters
- admin cancellation flow

### Client

Use the client demo account to review:

- client cabinet
- linked member profile
- active membership
- upcoming bookings
- booking history summary
- own booking cancellation

## Suggested walkthrough

### Admin walkthrough

1. Sign in with the demo admin account.
2. Open the dashboard overview.
3. Review members, trainers, plans, sessions, and bookings.
4. Try sessions/bookings filtering.
5. Review how statuses and operational sorting work.
6. Optionally create or edit demo records.

### Client walkthrough

1. Sign in with the demo client account.
2. Open the cabinet overview.
3. Review active membership and upcoming bookings.
4. Open client bookings.
5. Optionally cancel an own future booking.

## Local demo

1. Clone the repository.
2. Install dependencies.

```bash
npm install
```

3. Create .env.local based on .env.example.

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

4. Start the app.

```bash
npm run dev
```

5. Open:

```txt
http://localhost:3000
```

## Testing

```bash
npm run quality
npm run e2e
```

E2E tests require dedicated admin/client test accounts configured in `.env.local`.
