import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingsFilters, { type BookingsFiltersProps } from './bookings-filters'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const trainers = [
  { id: 'trainer-1', full_name: 'Sam Coach' },
  { id: 'trainer-2', full_name: 'Mia Trainer' },
]

const defaultProps: BookingsFiltersProps = {
  member: '',
  session: '',
  trainer: '',
  trainers,
  selectedStatuses: [],
  from: '',
  to: '',
  sort: 'upcoming',
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('BookingsFilters', () => {
  beforeEach(() => {
    pushMock.mockClear()
    mockMatchMedia(true)
  })

  it('renders every applied filter value', () => {
    render(
      <BookingsFilters
        {...defaultProps}
        member='alex@example.com'
        session='strength'
        trainer='trainer-1'
        selectedStatuses={['completed']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    expect(screen.getByLabelText('Member search')).toHaveValue('alex@example.com')
    expect(screen.getByLabelText('Session search')).toHaveValue('strength')
    expect(screen.getByRole('button', { name: 'Trainer: Sam Coach' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Booking status: Completed' })).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toHaveValue('2026-07-01')
    expect(screen.getByLabelText('To')).toHaveValue('2026-07-31')
    expect(screen.getByRole('button', { name: 'Sort: Latest first' })).toBeInTheDocument()
  })

  it('applies every supported filter through a canonical URL and resets page to one', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} />)

    await user.type(screen.getByLabelText('Member search'), '  alex@example.com  ')
    await user.type(screen.getByLabelText('Session search'), '  Morning strength  ')

    await user.click(screen.getByRole('button', { name: 'Trainer: All trainers' }))
    await user.click(screen.getByLabelText('Trainer: Sam Coach'))

    await user.click(screen.getByRole('button', { name: 'Booking status: All' }))
    await user.click(screen.getByLabelText('Booking status: Cancelled'))
    await user.click(screen.getByLabelText('Booking status: Confirmed'))

    await user.type(screen.getByLabelText('From'), '2026-07-01')
    await user.type(screen.getByLabelText('To'), '2026-07-31')

    await user.click(screen.getByRole('button', { name: 'Sort: Upcoming first' }))
    await user.click(screen.getByLabelText('Sort: Latest first'))

    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/bookings?member=alex%40example.com&session=Morning+strength&trainer=trainer-1&statuses=confirmed&statuses=cancelled&from=2026-07-01&to=2026-07-31&sort=latest',
    )
  })

  it('submits naturally when Enter is pressed in a search input', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} />)

    await user.type(screen.getByLabelText('Member search'), 'Jamie{Enter}')

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings?member=Jamie')
  })

  it('toggles multiple statuses independently through the shared multi-select', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Booking status: All' }))
    await user.click(screen.getByLabelText('Booking status: Confirmed'))
    await user.click(screen.getByLabelText('Booking status: Completed'))

    expect(screen.getByRole('button', { name: 'Booking status: 2 selected' })).toBeInTheDocument()

    await user.click(screen.getByLabelText('Booking status: Confirmed'))

    expect(screen.getByRole('button', { name: 'Booking status: Completed' })).toBeInTheDocument()
  })

  it('resets every draft filter and navigates to the base URL', async () => {
    const user = userEvent.setup()

    render(
      <BookingsFilters
        {...defaultProps}
        member='Alex'
        session='Strength'
        trainer='trainer-1'
        selectedStatuses={['confirmed', 'cancelled']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings')
    expect(screen.getByLabelText('Member search')).toHaveValue('')
    expect(screen.getByLabelText('Session search')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Trainer: All trainers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Booking status: All' })).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toHaveValue('')
    expect(screen.getByLabelText('To')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Sort: Upcoming first' })).toBeInTheDocument()
  })

  it('blocks applying an invalid date range and exposes one accessible error', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} from='2026-07-08' to='2026-07-01' />)

    const error = screen.getByText('From date must be on or before To date.')
    expect(error).toHaveAttribute('role', 'alert')

    expect(screen.getByLabelText('From')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('To')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('From')).toHaveAccessibleDescription(
      'From date must be on or before To date.',
    )
    expect(screen.getByLabelText('To')).toHaveAccessibleDescription(
      'From date must be on or before To date.',
    )

    const applyButton = screen.getByRole('button', { name: 'Apply filters' })
    expect(applyButton).toBeDisabled()

    await user.click(applyButton)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('allows applying after the date range becomes valid', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} from='2026-07-08' to='2026-07-01' />)

    await user.clear(screen.getByLabelText('To'))
    await user.type(screen.getByLabelText('To'), '2026-07-08')

    expect(screen.queryByText('From date must be on or before To date.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/bookings?from=2026-07-08&to=2026-07-08')
  })

  it('surfaces a trainer-options error without hiding the remaining controls', () => {
    render(<BookingsFilters {...defaultProps} trainers={[]} trainerOptionsError='Database error' />)

    expect(screen.getByText('Failed to load trainer options.')).toBeInTheDocument()
    expect(screen.getByLabelText('Member search')).toBeInTheDocument()
    expect(screen.getByLabelText('Session search')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trainer: All trainers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Booking status: All' })).toBeInTheDocument()
  })

  it('counts applied filter groups once each on mobile', () => {
    render(
      <BookingsFilters
        {...defaultProps}
        member='Alex'
        session='Strength'
        trainer='trainer-1'
        selectedStatuses={['confirmed', 'cancelled']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    const filtersToggle = screen.getByRole('button', {
      name: /^filters\b/i,
      expanded: false,
    })

    expect(filtersToggle).toHaveTextContent('7 active filters')
  })

  it('counts applied values instead of unsaved draft values on mobile', async () => {
    const user = userEvent.setup()

    render(<BookingsFilters {...defaultProps} />)

    const filtersToggle = screen.getByRole('button', {
      name: /^filters\b/i,
      expanded: false,
    })

    await user.click(filtersToggle)
    await user.type(screen.getByLabelText('Member search'), 'unsaved')

    expect(filtersToggle).toHaveTextContent('No active filters')
  })
})
