import { render, screen } from '@testing-library/react'
import type { DerivedSessionStatus, SessionSort } from '../model/session'
import SessionsPagination from './sessions-pagination'

const baseProps: {
  pageSize: number
  totalCount: number
  totalPages: number
  search: string
  trainer: string
  statuses: DerivedSessionStatus[]
  from: string
  to: string
  sort: SessionSort
} = {
  pageSize: 10,
  totalCount: 23,
  totalPages: 3,
  search: 'Morning strength',
  trainer: 'trainer-1',
  statuses: ['completed', 'scheduled'],
  from: '2026-07-01',
  to: '2026-07-31',
  sort: 'latest',
}

describe('SessionsPagination', () => {
  it('renders result summary, current page and filter-preserving canonical links', () => {
    render(<SessionsPagination {...baseProps} currentPage={2} />)

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 11–20 of 23')
    expect(screen.getByLabelText('Page 2 of 3')).toHaveTextContent('2 of 3')

    const firstPageHref =
      '/dashboard/sessions?search=Morning+strength&trainer=trainer-1&statuses=scheduled&statuses=completed&from=2026-07-01&to=2026-07-31&sort=latest'
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
    render(<SessionsPagination {...baseProps} currentPage={1} />)

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
    render(<SessionsPagination {...baseProps} currentPage={3} />)

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
