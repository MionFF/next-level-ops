import { render, screen } from '@testing-library/react'
import type { CabinetUpcomingBooking } from '../model/cabinet-booking'
import { UpcomingBookingsList } from './upcoming-bookings-list'

jest.mock('./cancel-own-booking-button', () => ({
  CancelOwnBookingButton: ({ bookingId }: { bookingId: string }) => (
    <button type='button'>Cancel own booking {bookingId}</button>
  ),
}))

const bookings: CabinetUpcomingBooking[] = [
  {
    id: 'booking-1',
    status: 'confirmed',
    created_at: '2026-05-20T10:00:00.000Z',
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
  },
  {
    id: 'booking-2',
    status: 'confirmed',
    created_at: '2026-05-21T10:00:00.000Z',
    session: {
      id: 'session-2',
      title: 'Evening Mobility',
      starts_at: '2026-06-02T18:00:00.000Z',
      ends_at: '2026-06-02T19:00:00.000Z',
      trainer: null,
    },
  },
]

describe('UpcomingBookingsList', () => {
  it('renders empty state when there are no upcoming bookings', () => {
    render(<UpcomingBookingsList bookings={[]} />)

    expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument()
  })

  it('renders upcoming booking data', () => {
    render(<UpcomingBookingsList bookings={bookings} />)

    expect(screen.getByRole('heading', { name: /upcoming bookings/i })).toBeInTheDocument()

    expect(screen.getAllByText('Morning Strength').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sam Coach').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Evening Mobility').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0)
  })

  it('renders fallback values when session relation is missing', () => {
    render(
      <UpcomingBookingsList
        bookings={[
          {
            id: 'booking-missing-session',
            status: 'confirmed',
            created_at: '2026-05-20T10:00:00.000Z',
            session: null,
          },
        ]}
      />,
    )

    expect(screen.getAllByText(/unknown/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders cancel controls for upcoming bookings', () => {
    render(<UpcomingBookingsList bookings={bookings} />)

    expect(screen.getAllByRole('button', { name: /cancel own booking booking-1/i })).toHaveLength(2)

    expect(screen.getAllByRole('button', { name: /cancel own booking booking-2/i })).toHaveLength(2)
  })
})
