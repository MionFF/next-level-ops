import { fetchDashboardSummary } from './dashboard-summary'

type TableName = 'members' | 'trainers' | 'membership_plans' | 'sessions' | 'bookings'

type QueryResult = {
  count: number | null
  error: { message: string } | null
}

type DeferredQuery = {
  builder: {
    select: jest.Mock
    eq: jest.Mock
    gt: jest.Mock
    then: (
      onFulfilled: (result: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise<unknown>
  }
  resolve: (result: QueryResult) => void
  started: jest.Mock
}

type SupabaseClientMock = {
  from: jest.Mock
}

const tableNames: TableName[] = ['members', 'trainers', 'membership_plans', 'sessions', 'bookings']

let mockSupabaseClient: SupabaseClientMock

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockSupabaseClient),
}))

function createDeferredQuery(): DeferredQuery {
  let resolvePromise: (result: QueryResult) => void = () => undefined
  const promise = new Promise<QueryResult>(resolve => {
    resolvePromise = resolve
  })
  const started = jest.fn()
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    gt: jest.fn(),
    then: (
      onFulfilled: (result: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => {
      started()
      return promise.then(onFulfilled, onRejected)
    },
  }

  builder.select.mockImplementation(() => builder)
  builder.eq.mockImplementation(() => builder)
  builder.gt.mockImplementation(() => builder)

  return { builder, resolve: resolvePromise, started }
}

function createSupabaseMock() {
  const queries: Record<TableName, DeferredQuery> = {
    members: createDeferredQuery(),
    trainers: createDeferredQuery(),
    membership_plans: createDeferredQuery(),
    sessions: createDeferredQuery(),
    bookings: createDeferredQuery(),
  }
  const from = jest.fn((table: TableName) => queries[table].builder)

  mockSupabaseClient = { from }

  return { from, queries }
}

function resolveSuccessfulQueries(
  queries: Record<TableName, DeferredQuery>,
  counts: Record<TableName, number | null>,
) {
  for (const table of tableNames) {
    queries[table].resolve({ count: counts[table], error: null })
  }
}

describe('fetchDashboardSummary', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-02T09:30:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('starts all five count queries before any query resolves', async () => {
    const { from, queries } = createSupabaseMock()

    const summaryPromise = fetchDashboardSummary()
    await Promise.resolve()
    await Promise.resolve()

    expect(from.mock.calls.map(([table]) => table)).toEqual([
      'members',
      'trainers',
      'membership_plans',
      'sessions',
      'bookings',
    ])
    expect(Object.values(queries).every(query => query.started.mock.calls.length === 1)).toBe(true)

    resolveSuccessfulQueries(queries, {
      members: 12,
      trainers: 3,
      membership_plans: 4,
      sessions: 5,
      bookings: 9,
    })

    await expect(summaryPromise).resolves.toEqual({
      totalMembers: 12,
      totalTrainers: 3,
      activePlans: 4,
      upcomingSessions: 5,
      confirmedBookings: 9,
    })
  })

  it('preserves the query contract and normalizes successful null counts', async () => {
    const { queries } = createSupabaseMock()

    const summaryPromise = fetchDashboardSummary()
    await Promise.resolve()
    await Promise.resolve()

    for (const query of Object.values(queries)) {
      expect(query.builder.select).toHaveBeenCalledWith('id', {
        count: 'exact',
        head: true,
      })
    }
    expect(queries.members.builder.eq).not.toHaveBeenCalled()
    expect(queries.trainers.builder.eq).not.toHaveBeenCalled()
    expect(queries.membership_plans.builder.eq).toHaveBeenCalledWith('status', 'active')
    expect(queries.sessions.builder.eq).toHaveBeenCalledWith('status', 'scheduled')
    expect(queries.sessions.builder.gt).toHaveBeenCalledWith(
      'starts_at',
      '2026-08-02T09:30:00.000Z',
    )
    expect(queries.bookings.builder.eq).toHaveBeenCalledWith('status', 'confirmed')

    resolveSuccessfulQueries(queries, {
      members: null,
      trainers: 2,
      membership_plans: null,
      sessions: 6,
      bookings: null,
    })

    await expect(summaryPromise).resolves.toEqual({
      totalMembers: 0,
      totalTrainers: 2,
      activePlans: 0,
      upcomingSessions: 6,
      confirmedBookings: 0,
    })
  })

  it('rejects with the failed Dashboard metric instead of returning a zero count', async () => {
    const { queries } = createSupabaseMock()

    const summaryPromise = fetchDashboardSummary()
    await Promise.resolve()
    await Promise.resolve()

    queries.members.resolve({ count: 12, error: null })
    queries.trainers.resolve({ count: 3, error: null })
    queries.membership_plans.resolve({ count: 4, error: null })
    queries.sessions.resolve({
      count: null,
      error: { message: 'sessions count unavailable' },
    })
    queries.bookings.resolve({ count: 9, error: null })

    await expect(summaryPromise).rejects.toThrow(
      'Failed to fetch Dashboard upcoming sessions: sessions count unavailable',
    )
  })
})
