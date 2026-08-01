import { render, screen } from '@testing-library/react'
import { OperationsPagination } from './operations-pagination'

const getPageHref = (page: number) => `/operations?page=${page}`

function renderPagination({
  currentPage = 2,
  totalPages = 3,
  totalCount = 23,
}: {
  currentPage?: number
  totalPages?: number
  totalCount?: number
} = {}) {
  render(
    <OperationsPagination
      ariaLabel='Operations pagination'
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={10}
      getPageHref={getPageHref}
    />,
  )
}

describe('OperationsPagination', () => {
  it('renders an accessible middle page with a result summary and directional links', () => {
    renderPagination()

    expect(screen.getByRole('navigation', { name: 'Operations pagination' })).toBeInTheDocument()
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 11–20 of 23')

    const currentPage = screen.getByLabelText('Page 2 of 3')
    expect(currentPage).toHaveTextContent('2 of 3')
    expect(currentPage).toHaveAttribute('aria-current', 'page')

    expect(screen.getByRole('link', { name: 'First page' })).toHaveAttribute(
      'href',
      '/operations?page=1',
    )
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute(
      'href',
      '/operations?page=1',
    )
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute(
      'href',
      '/operations?page=3',
    )
    expect(screen.getByRole('link', { name: 'Last page' })).toHaveAttribute(
      'href',
      '/operations?page=3',
    )
  })

  it('disables First and Previous on the first page', () => {
    renderPagination({ currentPage: 1 })

    for (const label of ['First', 'Previous']) {
      const control = screen.getByRole('link', { name: `${label} page` })
      expect(control).toHaveAttribute('aria-disabled', 'true')
      expect(control).not.toHaveAttribute('href')
    }

    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute(
      'href',
      '/operations?page=2',
    )
    expect(screen.getByRole('link', { name: 'Last page' })).toHaveAttribute(
      'href',
      '/operations?page=3',
    )
  })

  it('disables Next and Last on the last page and reports the final result range', () => {
    renderPagination({ currentPage: 3 })

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 21–23 of 23')
    expect(screen.getByRole('link', { name: 'First page' })).toHaveAttribute(
      'href',
      '/operations?page=1',
    )
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute(
      'href',
      '/operations?page=2',
    )

    for (const label of ['Next', 'Last']) {
      const control = screen.getByRole('link', { name: `${label} page` })
      expect(control).toHaveAttribute('aria-disabled', 'true')
      expect(control).not.toHaveAttribute('href')
    }
  })

  it('disables every directional control for a one-page result', () => {
    renderPagination({ currentPage: 1, totalPages: 1, totalCount: 7 })

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 1–7 of 7')
    expect(screen.getByLabelText('Page 1 of 1')).toHaveTextContent('1 of 1')

    for (const label of ['First', 'Previous', 'Next', 'Last']) {
      const control = screen.getByRole('link', { name: `${label} page` })
      expect(control).toHaveAttribute('aria-disabled', 'true')
      expect(control).not.toHaveAttribute('href')
    }
  })
})
