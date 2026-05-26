import { render, screen } from '@testing-library/react'
import type { Booking } from '../model/booking'
import BookingsList from './bookings-list'

jest.mock('./cancel-booking-button', () => ({
  __esModule: true,
  default: ({ bookingId }: { bookingId: string }) => (
    <button type='button'>Cancel booking {bookingId}</button>
  ),
}))

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
      starts_at: '2026-06-01T10:00:00.000Z',
      ends_at: '2026-06-01T11:00:00.000Z',
      trainer: {
        id: 'trainer-1',
        full_name: 'Sam Coach',
      },
    },
    ...overrides,
  }
}

describe('BookingsList', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-21T12:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders error state when bookings fail to load', () => {
    render(<BookingsList bookings={[]} errorMessage='Database error' hasActiveFilters={false} />)

    expect(screen.getByText('Failed to load bookings.')).toBeInTheDocument()
    expect(screen.queryByText('No bookings found.')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no bookings', () => {
    render(<BookingsList bookings={[]} errorMessage={undefined} hasActiveFilters={false} />)

    expect(screen.getByText('No bookings found.')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load bookings.')).not.toBeInTheDocument()
  })

  it('renders filtered empty state when filters are active', () => {
    render(<BookingsList bookings={[]} errorMessage={undefined} hasActiveFilters />)

    expect(screen.getByText('No bookings match your filters.')).toBeInTheDocument()
    expect(screen.queryByText('No bookings found.')).not.toBeInTheDocument()
  })

  it('renders booking data and primary actions', () => {
    const bookings = [
      createBooking({
        id: 'booking-1',
      }),
      createBooking({
        id: 'booking-2',
        member: {
          id: 'member-2',
          full_name: 'Jamie Lee',
          email: 'jamie@example.com',
        },
        session: {
          id: 'session-2',
          title: 'Evening Mobility',
          starts_at: '2026-06-02T18:00:00.000Z',
          ends_at: '2026-06-02T19:00:00.000Z',
          trainer: {
            id: 'trainer-2',
            full_name: 'Mia Trainer',
          },
        },
      }),
    ]

    render(<BookingsList bookings={bookings} errorMessage={undefined} hasActiveFilters={false} />)

    expect(screen.getByRole('heading', { name: /bookings/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add booking/i })).toHaveAttribute(
      'href',
      '/dashboard/bookings/new',
    )

    expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('alex@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Morning Strength').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sam Coach').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Jamie Lee').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jamie@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Evening Mobility').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Mia Trainer').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0)
  })

  it('renders fallback values when booking relations are missing', () => {
    const bookings = [
      createBooking({
        id: 'booking-missing-relations',
        member: null,
        session: null,
      }),
    ]

    render(<BookingsList bookings={bookings} errorMessage={undefined} hasActiveFilters={false} />)

    expect(screen.getAllByText(/unknown/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders cancel controls only for confirmed bookings', () => {
    const confirmedBooking = createBooking({
      id: 'confirmed-booking',
      session: {
        id: 'future-session',
        title: 'Future Strength',
        starts_at: '2026-06-01T10:00:00.000Z',
        ends_at: '2026-06-01T11:00:00.000Z',
        trainer: {
          id: 'trainer-1',
          full_name: 'Sam Coach',
        },
      },
    })

    const inProgressBooking = createBooking({
      id: 'in-progress-booking',
      session: {
        id: 'current-session',
        title: 'Current Session',
        starts_at: '2026-05-21T11:00:00.000Z',
        ends_at: '2026-05-21T13:00:00.000Z',
        trainer: {
          id: 'trainer-2',
          full_name: 'Mia Trainer',
        },
      },
    })

    const completedBooking = createBooking({
      id: 'completed-booking',
      session: {
        id: 'past-session',
        title: 'Past Session',
        starts_at: '2026-05-20T10:00:00.000Z',
        ends_at: '2026-05-20T11:00:00.000Z',
        trainer: null,
      },
    })

    const cancelledBooking = createBooking({
      id: 'cancelled-booking',
      status: 'cancelled',
    })

    render(
      <BookingsList
        bookings={[confirmedBooking, inProgressBooking, completedBooking, cancelledBooking]}
        errorMessage={undefined}
        hasActiveFilters={false}
      />,
    )

    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('In progress').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('button', { name: /cancel booking confirmed-booking/i }),
    ).toHaveLength(2)

    expect(
      screen.queryByRole('button', { name: /cancel booking in-progress-booking/i }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: /cancel booking completed-booking/i }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: /cancel booking cancelled-booking/i }),
    ).not.toBeInTheDocument()
  })
})
