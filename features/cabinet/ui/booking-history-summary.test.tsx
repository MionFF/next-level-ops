import { render, screen } from '@testing-library/react'
import { BookingHistorySummaryCard } from './booking-history-summary'

describe('BookingHistorySummaryCard', () => {
  it('renders booking summary counts', () => {
    render(
      <BookingHistorySummaryCard
        summary={{
          total: 12,
          upcoming: 3,
          completed: 7,
          cancelled: 2,
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: /booking summary/i })).toBeInTheDocument()

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
