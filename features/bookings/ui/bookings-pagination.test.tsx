import { render, screen } from '@testing-library/react'
import BookingsPagination from './bookings-pagination'

describe('BookingsPagination', () => {
  it('preserves filters and emits canonical booking URLs', () => {
    render(
      <BookingsPagination
        currentPage={2}
        pageSize={10}
        totalCount={23}
        totalPages={3}
        member='Alex Morgan'
        session='Morning strength'
        trainer='trainer-1'
        statuses={['cancelled', 'confirmed']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    const firstPageHref =
      '/dashboard/bookings?member=Alex+Morgan&session=Morning+strength&trainer=trainer-1&statuses=confirmed&statuses=cancelled&from=2026-07-01&to=2026-07-31&sort=latest'
    const lastPageHref = `${firstPageHref}&page=3`

    expect(screen.getByRole('link', { name: 'First page' })).toHaveAttribute('href', firstPageHref)
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute(
      'href',
      firstPageHref,
    )
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', lastPageHref)
    expect(screen.getByRole('link', { name: 'Last page' })).toHaveAttribute('href', lastPageHref)
  })
})
