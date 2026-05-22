import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingsFilters from './bookings-filters'

const pushMock = jest.fn()
let pathnameMock = '/dashboard/bookings'
let searchParamsMock = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}))

const statusCounts = {
  confirmed: 4,
  in_progress: 1,
  completed: 8,
  cancelled: 2,
}

describe('BookingsFilters', () => {
  beforeEach(() => {
    pushMock.mockClear()
    pathnameMock = '/dashboard/bookings'
    searchParamsMock = new URLSearchParams()
  })

  it('renders member search, session search, status filter, and actions', () => {
    render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    expect(screen.getByPlaceholderText(/member name or email/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/session title/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('applies trimmed member and session search values to the URL', async () => {
    const user = userEvent.setup()

    render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    await user.type(screen.getByPlaceholderText(/member name or email/i), '  alex@example.com  ')
    await user.type(screen.getByPlaceholderText(/session title/i), '  Strength  ')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/bookings?member=alex%40example.com&session=Strength',
    )
  })

  it('applies selected booking statuses to the URL', async () => {
    const user = userEvent.setup()

    render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    await user.click(screen.getByRole('button', { name: /status all/i }))
    await user.click(screen.getByLabelText(/confirmed/i))
    await user.click(screen.getByLabelText(/cancelled/i))
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/bookings?statuses=confirmed&statuses=cancelled',
    )
  })

  it('preserves unrelated existing search params when applying filters', async () => {
    const user = userEvent.setup()
    searchParamsMock = new URLSearchParams('page=3')

    render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    await user.type(screen.getByPlaceholderText(/member name or email/i), 'Alex')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings?page=3&member=Alex')
  })

  it('applies filters when pressing Enter in a search input', async () => {
    const user = userEvent.setup()

    render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    await user.type(screen.getByPlaceholderText(/member name or email/i), 'Jamie{Enter}')

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings?member=Jamie')
  })

  it('resets filters and navigates to the base pathname', async () => {
    const user = userEvent.setup()

    render(
      <BookingsFilters
        member='Alex'
        session='Strength'
        selectedStatuses={['confirmed', 'cancelled']}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByPlaceholderText(/member name or email/i)).toHaveValue('Alex')
    expect(screen.getByPlaceholderText(/session title/i)).toHaveValue('Strength')
    expect(screen.getByRole('button', { name: /status 2 selected/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings')
    expect(screen.getByPlaceholderText(/member name or email/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/session title/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()
  })

  it('syncs draft state when filter props change', () => {
    const { rerender } = render(
      <BookingsFilters member='' session='' selectedStatuses={[]} statusCounts={statusCounts} />,
    )

    expect(screen.getByPlaceholderText(/member name or email/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/session title/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()

    rerender(
      <BookingsFilters
        member='alex@example.com'
        session='Mobility'
        selectedStatuses={['completed']}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByPlaceholderText(/member name or email/i)).toHaveValue('alex@example.com')
    expect(screen.getByPlaceholderText(/session title/i)).toHaveValue('Mobility')
    expect(screen.getByRole('button', { name: /status 1 selected/i })).toBeInTheDocument()
  })
})
