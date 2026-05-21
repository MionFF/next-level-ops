import {
  getBookingDisplayBadge,
  getDerivedBookingStatus,
  isDerivedBookingStatus,
  sortBookings,
  type Booking,
} from './booking'

const NOW = new Date('2026-05-21T12:00:00.000Z')

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    session_id: 'session-1',
    member_id: 'member-1',
    status: 'confirmed',
    created_at: '2026-05-20T10:00:00.000Z',
    member: {
      id: 'member-1',
      full_name: 'Alex Morgan',
      email: 'alex@example.com',
    },
    session: {
      id: 'session-1',
      title: 'Morning Strength',
      starts_at: '2026-05-22T10:00:00.000Z',
      ends_at: '2026-05-22T11:00:00.000Z',
      trainer: {
        id: 'trainer-1',
        full_name: 'Sam Coach',
      },
    },
    ...overrides,
  }
}

describe('booking model', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('getDerivedBookingStatus', () => {
    it('returns cancelled when booking status is cancelled', () => {
      const booking = createBooking({
        status: 'cancelled',
        session: {
          id: 'session-1',
          title: 'Future Session',
          starts_at: '2026-05-22T10:00:00.000Z',
          ends_at: '2026-05-22T11:00:00.000Z',
          trainer: null,
        },
      })

      expect(getDerivedBookingStatus(booking)).toBe('cancelled')
    })

    it('returns completed when confirmed booking session already ended', () => {
      const booking = createBooking({
        session: {
          id: 'session-1',
          title: 'Past Session',
          starts_at: '2026-05-21T09:00:00.000Z',
          ends_at: '2026-05-21T10:00:00.000Z',
          trainer: null,
        },
      })

      expect(getDerivedBookingStatus(booking)).toBe('completed')
    })

    it('returns in_progress when confirmed booking session is currently running', () => {
      const booking = createBooking({
        session: {
          id: 'session-1',
          title: 'Current Session',
          starts_at: '2026-05-21T11:00:00.000Z',
          ends_at: '2026-05-21T13:00:00.000Z',
          trainer: null,
        },
      })

      expect(getDerivedBookingStatus(booking)).toBe('in_progress')
    })

    it('returns confirmed when confirmed booking session starts in the future', () => {
      const booking = createBooking({
        session: {
          id: 'session-1',
          title: 'Future Session',
          starts_at: '2026-05-22T10:00:00.000Z',
          ends_at: '2026-05-22T11:00:00.000Z',
          trainer: null,
        },
      })

      expect(getDerivedBookingStatus(booking)).toBe('confirmed')
    })

    it('returns confirmed when booking has no session data', () => {
      const booking = createBooking({
        session: null,
      })

      expect(getDerivedBookingStatus(booking)).toBe('confirmed')
    })
  })

  describe('isDerivedBookingStatus', () => {
    it('accepts supported derived booking statuses', () => {
      expect(isDerivedBookingStatus('confirmed')).toBe(true)
      expect(isDerivedBookingStatus('in_progress')).toBe(true)
      expect(isDerivedBookingStatus('completed')).toBe(true)
      expect(isDerivedBookingStatus('cancelled')).toBe(true)
    })

    it('rejects unsupported derived booking statuses', () => {
      expect(isDerivedBookingStatus('scheduled')).toBe(false)
      expect(isDerivedBookingStatus('full')).toBe(false)
      expect(isDerivedBookingStatus('unknown')).toBe(false)
      expect(isDerivedBookingStatus(undefined)).toBe(false)
    })
  })

  describe('getBookingDisplayBadge', () => {
    it('returns display labels for derived booking statuses', () => {
      expect(getBookingDisplayBadge('confirmed').text).toBe('Confirmed')
      expect(getBookingDisplayBadge('in_progress').text).toBe('In progress')
      expect(getBookingDisplayBadge('completed').text).toBe('Completed')
      expect(getBookingDisplayBadge('cancelled').text).toBe('Cancelled')
    })
  })

  describe('sortBookings', () => {
    it('sorts bookings by derived status priority', () => {
      const completed = createBooking({
        id: 'completed',
        session: {
          id: 'session-completed',
          title: 'Completed Session',
          starts_at: '2026-05-21T09:00:00.000Z',
          ends_at: '2026-05-21T10:00:00.000Z',
          trainer: null,
        },
      })

      const cancelled = createBooking({
        id: 'cancelled',
        status: 'cancelled',
      })

      const inProgress = createBooking({
        id: 'in-progress',
        session: {
          id: 'session-current',
          title: 'Current Session',
          starts_at: '2026-05-21T11:00:00.000Z',
          ends_at: '2026-05-21T13:00:00.000Z',
          trainer: null,
        },
      })

      const confirmed = createBooking({
        id: 'confirmed',
        session: {
          id: 'session-future',
          title: 'Future Session',
          starts_at: '2026-05-22T10:00:00.000Z',
          ends_at: '2026-05-22T11:00:00.000Z',
          trainer: null,
        },
      })

      const result = sortBookings([completed, cancelled, inProgress, confirmed])

      expect(result.map(booking => booking.id)).toEqual([
        'confirmed',
        'in-progress',
        'completed',
        'cancelled',
      ])
    })

    it('sorts confirmed and in-progress bookings by session start time ascending', () => {
      const laterConfirmed = createBooking({
        id: 'later-confirmed',
        session: {
          id: 'session-later',
          title: 'Later Session',
          starts_at: '2026-05-24T10:00:00.000Z',
          ends_at: '2026-05-24T11:00:00.000Z',
          trainer: null,
        },
      })

      const earlierConfirmed = createBooking({
        id: 'earlier-confirmed',
        session: {
          id: 'session-earlier',
          title: 'Earlier Session',
          starts_at: '2026-05-22T10:00:00.000Z',
          ends_at: '2026-05-22T11:00:00.000Z',
          trainer: null,
        },
      })

      const result = sortBookings([laterConfirmed, earlierConfirmed])

      expect(result.map(booking => booking.id)).toEqual(['earlier-confirmed', 'later-confirmed'])
    })

    it('sorts completed and cancelled bookings by session start time descending', () => {
      const olderCompleted = createBooking({
        id: 'older-completed',
        session: {
          id: 'session-older',
          title: 'Older Completed Session',
          starts_at: '2026-05-19T10:00:00.000Z',
          ends_at: '2026-05-19T11:00:00.000Z',
          trainer: null,
        },
      })

      const newerCompleted = createBooking({
        id: 'newer-completed',
        session: {
          id: 'session-newer',
          title: 'Newer Completed Session',
          starts_at: '2026-05-20T10:00:00.000Z',
          ends_at: '2026-05-20T11:00:00.000Z',
          trainer: null,
        },
      })

      const result = sortBookings([olderCompleted, newerCompleted])

      expect(result.map(booking => booking.id)).toEqual(['newer-completed', 'older-completed'])
    })

    it('does not mutate the original bookings array', () => {
      const later = createBooking({
        id: 'later',
        session: {
          id: 'session-later',
          title: 'Later Session',
          starts_at: '2026-05-24T10:00:00.000Z',
          ends_at: '2026-05-24T11:00:00.000Z',
          trainer: null,
        },
      })

      const earlier = createBooking({
        id: 'earlier',
        session: {
          id: 'session-earlier',
          title: 'Earlier Session',
          starts_at: '2026-05-22T10:00:00.000Z',
          ends_at: '2026-05-22T11:00:00.000Z',
          trainer: null,
        },
      })

      const input = [later, earlier]
      const result = sortBookings(input)

      expect(input.map(booking => booking.id)).toEqual(['later', 'earlier'])
      expect(result.map(booking => booking.id)).toEqual(['earlier', 'later'])
      expect(result).not.toBe(input)
    })
  })
})
