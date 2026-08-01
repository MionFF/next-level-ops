import { render, screen } from '@testing-library/react'
import SessionsPagination from './sessions-pagination'

describe('SessionsPagination', () => {
  it('preserves filters and emits canonical session URLs', () => {
    render(
      <SessionsPagination
        currentPage={2}
        pageSize={10}
        totalCount={23}
        totalPages={3}
        search='Morning strength'
        trainer='trainer-1'
        statuses={['completed', 'scheduled']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    const firstPageHref =
      '/dashboard/sessions?search=Morning+strength&trainer=trainer-1&statuses=scheduled&statuses=completed&from=2026-07-01&to=2026-07-31&sort=latest'
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
