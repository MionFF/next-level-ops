import { render, screen } from '@testing-library/react'
import type { BookingSort, DerivedBookingStatus } from '../model/booking'
import BookingsPagination from './bookings-pagination'

const baseProps: {
  pageSize: number
  totalCount: number
  totalPages: number
  member: string
  session: string
  trainer: string
  statuses: DerivedBookingStatus[]
  from: string
  to: string
  sort: BookingSort
} = {
  pageSize: 10,
  totalCount: 23,
  totalPages: 3,
  member: 'Alex Morgan',
  session: 'Morning strength',
  trainer: 'trainer-1',
  statuses: ['cancelled', 'confirmed'],
  from: '2026-07-01',
  to: '2026-07-31',
  sort: 'latest',
}

describe('BookingsPagination', () => {
  it('renders the result summary and filter-preserving canonical links on a middle page', () => {
    render(<BookingsPagination {...baseProps} currentPage={2} />)

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 11–20 of 23')
    expect(screen.getByLabelText('Page 2 of 3')).toHaveTextContent('2 of 3')

    const firstPageHref =
      '/dashboard/bookings?member=Alex+Morgan&session=Morning+strength&trainer=trainer-1&statuses=confirmed&statuses=cancelled&from=2026-07-01&to=2026-07-31&sort=latest'
    const lastPageHref = `${firstPageHref}&page=3`

    expect(screen.getByRole('link', { name: 'First page' })).toHaveAttribute(
      'href',
      firstPageHref,
    )
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute(
      'href',
      firstPageHref,
    )
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute(
      'href',
      lastPageHref,
    )
    expect(screen.getByRole('link', { name: 'Last page' })).toHaveAttribute(
      'href',
      lastPageHref,
    )
  })

  it('disables first and previous controls on the first page', () => {
    render(<BookingsPagination {...baseProps} currentPage={1} />)

    const firstPage = screen.getByRole('link', { name: 'First page' })
    const previousPage = screen.getByRole('link', { name: 'Previous page' })

    expect(firstPage).toHaveAttribute('aria-disabled', 'true')
    expect(firstPage).not.toHaveAttribute('href')
    expect(previousPage).toHaveAttribute('aria-disabled', 'true')
    expect(previousPage).not.toHaveAttribute('href')
    expect(screen.getByRole('link', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Last page' })).toBeInTheDocument()
  })

  it('disables next and last controls on the last page', () => {
    render(<BookingsPagination {...baseProps} currentPage={3} />)

    const nextPage = screen.getByRole('link', { name: 'Next page' })
    const lastPage = screen.getByRole('link', { name: 'Last page' })

    expect(screen.getByRole('link', { name: 'First page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
    expect(nextPage).toHaveAttribute('aria-disabled', 'true')
    expect(nextPage).not.toHaveAttribute('href')
    expect(lastPage).toHaveAttribute('aria-disabled', 'true')
    expect(lastPage).not.toHaveAttribute('href')
  })

  it('disables every directional control for a one-page result', () => {
    render(
      <BookingsPagination
        {...baseProps}
        currentPage={1}
        totalCount={7}
        totalPages={1}
      />,
    )

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 1–7 of 7')

    for (const label of ['First', 'Previous', 'Next', 'Last']) {
      expect(screen.getByRole('link', { name: `${label} page` })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
    }
  })
})
