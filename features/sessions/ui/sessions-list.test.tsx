import { render, screen } from '@testing-library/react'
import type { SessionOperationRow } from '../model/session'
import SessionsList from './sessions-list'

const sessions: SessionOperationRow[] = [
  {
    id: 'session-1',
    title: 'Future Strength',
    trainer_id: 'trainer-1',
    trainer_name: 'Sam Coach',
    starts_at: '2026-06-01T10:00:00.000Z',
    ends_at: '2026-06-01T11:00:00.000Z',
    capacity: 20,
    status: 'scheduled',
    created_at: '2026-05-20T10:00:00.000Z',
    confirmed_bookings_count: 8,
    derived_status: 'scheduled',
    available_spots: 12,
  },
  {
    id: 'session-2',
    title: 'Full Mobility',
    trainer_id: 'trainer-2',
    trainer_name: 'Mia Trainer',
    starts_at: '2026-06-02T18:00:00.000Z',
    ends_at: '2026-06-02T19:00:00.000Z',
    capacity: 12,
    status: 'scheduled',
    created_at: '2026-05-21T10:00:00.000Z',
    confirmed_bookings_count: 12,
    derived_status: 'full',
    available_spots: 0,
  },
]

describe('SessionsList', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-21T12:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders error state when sessions fail to load', () => {
    render(<SessionsList sessions={[]} errorMessage='Database error' />)

    expect(screen.getByText('Failed to load sessions.')).toBeInTheDocument()
    expect(screen.queryByText('No sessions found.')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no sessions', () => {
    render(<SessionsList sessions={[]} errorMessage={undefined} />)

    expect(screen.getByText('No sessions found.')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load sessions.')).not.toBeInTheDocument()
  })

  it('renders custom empty message when provided', () => {
    render(
      <SessionsList
        sessions={[]}
        errorMessage={undefined}
        emptyMessage='No sessions match your filters.'
      />,
    )

    expect(screen.getByText('No sessions match your filters.')).toBeInTheDocument()
  })

  it('renders session data, derived statuses, and primary actions', () => {
    render(<SessionsList sessions={sessions} errorMessage={undefined} />)

    expect(screen.getByRole('heading', { name: /sessions/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add session/i })).toHaveAttribute(
      'href',
      '/dashboard/sessions/new',
    )

    expect(screen.getAllByText('Future Strength').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sam Coach').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/8 \/ 20 booked/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Full Mobility').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Mia Trainer').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/12 \/ 12 booked/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Full').length).toBeGreaterThan(0)
  })

  it('renders edit links for sessions', () => {
    render(<SessionsList sessions={sessions} errorMessage={undefined} />)

    expect(screen.getAllByRole('link', { name: /edit/i })[0]).toHaveAttribute(
      'href',
      '/dashboard/sessions/session-1/edit',
    )

    expect(screen.getAllByRole('link', { name: /edit/i })[1]).toHaveAttribute(
      'href',
      '/dashboard/sessions/session-2/edit',
    )
  })
})
