import { render, screen } from '@testing-library/react'
import type { MemberStatus, MembershipOperationalStatus, ProfileLinkFilter } from '../model/member'
import MembersPagination from './members-pagination'

const baseProps: {
  pageSize: number
  totalCount: number
  totalPages: number
  search: string
  statuses: MemberStatus[]
  profile: ProfileLinkFilter
  memberships: MembershipOperationalStatus[]
} = {
  pageSize: 10,
  totalCount: 23,
  totalPages: 3,
  search: 'alex',
  statuses: ['paused', 'active'],
  profile: 'linked',
  memberships: ['expired', 'active'],
}

describe('MembersPagination', () => {
  it('renders result summary, current page and filter-preserving links', () => {
    render(<MembersPagination {...baseProps} currentPage={2} />)

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 11–20 of 23')

    expect(screen.getByLabelText('Page 2 of 3')).toHaveTextContent('2 of 3')

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

  it('disables first and previous controls on the first page', () => {
    render(<MembersPagination {...baseProps} currentPage={1} />)

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
    render(<MembersPagination {...baseProps} currentPage={3} />)

    const nextPage = screen.getByRole('link', { name: 'Next page' })
    const lastPage = screen.getByRole('link', { name: 'Last page' })

    expect(screen.getByRole('link', { name: 'First page' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()

    expect(nextPage).toHaveAttribute('aria-disabled', 'true')
    expect(nextPage).not.toHaveAttribute('href')

    expect(lastPage).toHaveAttribute('aria-disabled', 'true')
    expect(lastPage).not.toHaveAttribute('href')
  })
})
