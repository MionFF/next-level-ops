import {
  getDerivedSessionStatus,
  getSessionDisplayBadge,
  isDerivedSessionStatus,
  isSessionSort,
  sortSessionOperationRows,
  sortSessions,
  type Session,
  type SessionOperationRow,
} from './session'

const NOW = new Date('2026-05-21T12:00:00.000Z')

function createSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    title: 'Morning Strength',
    trainer_id: 'trainer-1',
    trainer: {
      id: 'trainer-1',
      full_name: 'Sam Coach',
    },
    starts_at: '2026-05-22T10:00:00.000Z',
    ends_at: '2026-05-22T11:00:00.000Z',
    capacity: 10,
    status: 'scheduled',
    created_at: '2026-05-20T10:00:00.000Z',
    confirmed_bookings_count: 0,
    ...overrides,
  }
}

function createOperationRow(overrides: Partial<SessionOperationRow> = {}): SessionOperationRow {
  return {
    id: 'session-operation-1',
    title: 'Morning Strength',
    trainer_id: 'trainer-1',
    trainer_name: 'Sam Coach',
    starts_at: '2026-05-22T10:00:00.000Z',
    ends_at: '2026-05-22T11:00:00.000Z',
    capacity: 10,
    status: 'scheduled',
    created_at: '2026-05-20T10:00:00.000Z',
    confirmed_bookings_count: 0,
    derived_status: 'scheduled',
    available_spots: 10,
    ...overrides,
  }
}

describe('session model', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('getDerivedSessionStatus', () => {
    it('returns cancelled before every temporal or capacity status', () => {
      const session = createSession({
        status: 'cancelled',
        starts_at: '2026-05-20T10:00:00.000Z',
        ends_at: '2026-05-20T11:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 10,
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('cancelled')
    })

    it('returns completed when ends_at equals now', () => {
      const session = createSession({
        starts_at: '2026-05-21T11:00:00.000Z',
        ends_at: NOW.toISOString(),
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('completed')
    })

    it('returns in_progress when starts_at equals now and ends_at is later', () => {
      const session = createSession({
        starts_at: NOW.toISOString(),
        ends_at: '2026-05-21T13:00:00.000Z',
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('in_progress')
    })

    it('returns full when future scheduled session has reached capacity', () => {
      const session = createSession({
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 10,
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('full')
    })

    it('returns full when future scheduled session exceeds capacity', () => {
      const session = createSession({
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 11,
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('full')
    })

    it('returns scheduled when future scheduled session has available capacity', () => {
      const session = createSession({
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 9,
      })

      expect(getDerivedSessionStatus(session, NOW)).toBe('scheduled')
    })
  })

  describe('isDerivedSessionStatus', () => {
    it('accepts supported derived session statuses', () => {
      expect(isDerivedSessionStatus('scheduled')).toBe(true)
      expect(isDerivedSessionStatus('in_progress')).toBe(true)
      expect(isDerivedSessionStatus('full')).toBe(true)
      expect(isDerivedSessionStatus('completed')).toBe(true)
      expect(isDerivedSessionStatus('cancelled')).toBe(true)
    })

    it('rejects unsupported derived session statuses', () => {
      expect(isDerivedSessionStatus('confirmed')).toBe(false)
      expect(isDerivedSessionStatus('unknown')).toBe(false)
      expect(isDerivedSessionStatus(undefined)).toBe(false)
    })
  })

  describe('isSessionSort', () => {
    it('accepts supported session sorts', () => {
      expect(isSessionSort('soonest')).toBe(true)
      expect(isSessionSort('latest')).toBe(true)
    })

    it('rejects unsupported session sorts', () => {
      expect(isSessionSort('oldest')).toBe(false)
      expect(isSessionSort(undefined)).toBe(false)
    })
  })

  describe('getSessionDisplayBadge', () => {
    it('returns display labels for derived session statuses', () => {
      expect(getSessionDisplayBadge('scheduled').text).toBe('Scheduled')
      expect(getSessionDisplayBadge('in_progress').text).toBe('In progress')
      expect(getSessionDisplayBadge('full').text).toBe('Full')
      expect(getSessionDisplayBadge('completed').text).toBe('Completed')
      expect(getSessionDisplayBadge('cancelled').text).toBe('Cancelled')
    })
  })

  describe('sortSessions', () => {
    it('sorts sessions by derived status priority', () => {
      const cancelled = createSession({
        id: 'cancelled',
        status: 'cancelled',
      })

      const completed = createSession({
        id: 'completed',
        starts_at: '2026-05-21T09:00:00.000Z',
        ends_at: '2026-05-21T10:00:00.000Z',
      })

      const full = createSession({
        id: 'full',
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 10,
      })

      const scheduled = createSession({
        id: 'scheduled',
        starts_at: '2026-05-22T09:00:00.000Z',
        ends_at: '2026-05-22T10:00:00.000Z',
        capacity: 10,
        confirmed_bookings_count: 2,
      })

      const inProgress = createSession({
        id: 'in-progress',
        starts_at: '2026-05-21T11:00:00.000Z',
        ends_at: '2026-05-21T13:00:00.000Z',
      })

      const result = sortSessions([cancelled, completed, full, scheduled, inProgress])

      expect(result.map(session => session.id)).toEqual([
        'in-progress',
        'scheduled',
        'full',
        'completed',
        'cancelled',
      ])
    })

    it('sorts active and future sessions by start time ascending within the same derived status', () => {
      const laterScheduled = createSession({
        id: 'later-scheduled',
        starts_at: '2026-05-24T10:00:00.000Z',
        ends_at: '2026-05-24T11:00:00.000Z',
      })

      const earlierScheduled = createSession({
        id: 'earlier-scheduled',
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
      })

      const result = sortSessions([laterScheduled, earlierScheduled])

      expect(result.map(session => session.id)).toEqual(['earlier-scheduled', 'later-scheduled'])
    })

    it('sorts completed and cancelled sessions by start time descending within the same derived status', () => {
      const olderCompleted = createSession({
        id: 'older-completed',
        starts_at: '2026-05-19T10:00:00.000Z',
        ends_at: '2026-05-19T11:00:00.000Z',
      })

      const newerCompleted = createSession({
        id: 'newer-completed',
        starts_at: '2026-05-20T10:00:00.000Z',
        ends_at: '2026-05-20T11:00:00.000Z',
      })

      const result = sortSessions([olderCompleted, newerCompleted])

      expect(result.map(session => session.id)).toEqual(['newer-completed', 'older-completed'])
    })

    it('does not mutate the original sessions array', () => {
      const later = createSession({
        id: 'later',
        starts_at: '2026-05-24T10:00:00.000Z',
        ends_at: '2026-05-24T11:00:00.000Z',
      })

      const earlier = createSession({
        id: 'earlier',
        starts_at: '2026-05-22T10:00:00.000Z',
        ends_at: '2026-05-22T11:00:00.000Z',
      })

      const input = [later, earlier]
      const result = sortSessions(input)

      expect(input.map(session => session.id)).toEqual(['later', 'earlier'])
      expect(result.map(session => session.id)).toEqual(['earlier', 'later'])
      expect(result).not.toBe(input)
    })
  })

  describe('sortSessionOperationRows', () => {
    it('sorts view rows by operation status priority', () => {
      const rows = [
        createOperationRow({ id: 'cancelled', derived_status: 'cancelled' }),
        createOperationRow({ id: 'completed', derived_status: 'completed' }),
        createOperationRow({ id: 'full', derived_status: 'full' }),
        createOperationRow({ id: 'scheduled', derived_status: 'scheduled' }),
        createOperationRow({ id: 'in-progress', derived_status: 'in_progress' }),
      ]

      expect(sortSessionOperationRows(rows).map(row => row.id)).toEqual([
        'in-progress',
        'scheduled',
        'full',
        'completed',
        'cancelled',
      ])
    })

    it('sorts active rows ascending and terminal rows descending by starts_at', () => {
      const rows = [
        createOperationRow({
          id: 'later-scheduled',
          starts_at: '2026-05-24T10:00:00.000Z',
        }),
        createOperationRow({
          id: 'earlier-scheduled',
          starts_at: '2026-05-22T10:00:00.000Z',
        }),
        createOperationRow({
          id: 'older-completed',
          starts_at: '2026-05-19T10:00:00.000Z',
          derived_status: 'completed',
        }),
        createOperationRow({
          id: 'newer-completed',
          starts_at: '2026-05-20T10:00:00.000Z',
          derived_status: 'completed',
        }),
      ]

      expect(sortSessionOperationRows(rows).map(row => row.id)).toEqual([
        'earlier-scheduled',
        'later-scheduled',
        'newer-completed',
        'older-completed',
      ])
      expect(rows.map(row => row.id)).toEqual([
        'later-scheduled',
        'earlier-scheduled',
        'older-completed',
        'newer-completed',
      ])
    })
  })
})
