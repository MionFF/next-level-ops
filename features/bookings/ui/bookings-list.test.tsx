import { render, screen } from '@testing-library/react'
import type { BookingOperationRow } from '../model/booking'
import BookingsList from './bookings-list'

jest.mock('./cancel-booking-button', () => ({
  __esModule: true,
  default: ({ bookingId }: { bookingId: string }) => (
    <button type='button'>Cancel booking {bookingId}</button>
  ),
}))

function createBooking(overrides: Partial<BookingOperationRow> = {}): BookingOperationRow {
  return {
    id: 'booking-1',
    session_id: 'session-1',
    member_id: 'member-1',
    status: 'confirmed',
    created_at: '2026-05-20T10:00:00.000Z',
    member_name: 'Alex Morgan',
    member_email: 'alex@example.com',
    session_title: 'Morning Strength',
    session_starts_at: '2026-06-01T10:00:00.000Z',
    session_ends_at: '2026-06-01T11:00:00.000Z',
    trainer_id: 'trainer-1',
    trainer_name: 'Sam Coach',
    derived_status: 'confirmed',
    is_cancellable: true,
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
        member_id: 'member-2',
        member_name: 'Jamie Lee',
        member_email: 'jamie@example.com',
        session_id: 'session-2',
        session_title: 'Evening Mobility',
        session_starts_at: '2026-06-02T18:00:00.000Z',
        session_ends_at: '2026-06-02T19:00:00.000Z',
        trainer_id: 'trainer-2',
        trainer_name: 'Mia Trainer',
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

  it('renders cancel controls only for rows marked cancellable', () => {
    const confirmedBooking = createBooking({
      id: 'confirmed-booking',
      session_id: 'future-session',
      session_title: 'Future Strength',
      is_cancellable: true,
    })

    const startedConfirmedBooking = createBooking({
      id: 'started-confirmed-booking',
      session_id: 'started-session',
      session_title: 'Started Session',
      derived_status: 'confirmed',
      is_cancellable: false,
    })

    const inProgressBooking = createBooking({
      id: 'in-progress-booking',
      session_id: 'current-session',
      session_title: 'Current Session',
      derived_status: 'in_progress',
      is_cancellable: false,
    })

    const completedBooking = createBooking({
      id: 'completed-booking',
      session_id: 'past-session',
      session_title: 'Past Session',
      derived_status: 'completed',
      is_cancellable: false,
    })

    const cancelledBooking = createBooking({
      id: 'cancelled-booking',
      status: 'cancelled',
      derived_status: 'cancelled',
      is_cancellable: false,
    })

    render(
      <BookingsList
        bookings={[
          confirmedBooking,
          startedConfirmedBooking,
          inProgressBooking,
          completedBooking,
          cancelledBooking,
        ]}
        errorMessage={undefined}
        hasActiveFilters={false}
      />,
    )

    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(2)
    expect(screen.getAllByText('In progress').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('button', { name: /cancel booking confirmed-booking/i }),
    ).toHaveLength(2)

    expect(
      screen.queryByRole('button', { name: /cancel booking started-confirmed-booking/i }),
    ).not.toBeInTheDocument()

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
