import { render, screen } from '@testing-library/react'
import MembersPagination from './members-pagination'

describe('MembersPagination', () => {
  it('preserves filters and emits canonical member URLs', () => {
    render(
      <MembersPagination
        currentPage={2}
        pageSize={10}
        totalCount={23}
        totalPages={3}
        search='alex'
        statuses={['paused', 'active']}
        profile='linked'
        memberships={['expired', 'active']}
      />,
    )

    const firstPageHref =
      '/dashboard/members?search=alex&status=active&status=paused&profile=linked&membership=active&membership=expired'
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
