import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionsFilters, { type SessionsFiltersProps } from './sessions-filters'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const trainers = [
  { id: 'trainer-1', full_name: 'Sam Coach' },
  { id: 'trainer-2', full_name: 'Mia Trainer' },
]

const defaultProps: SessionsFiltersProps = {
  search: '',
  trainer: '',
  trainers,
  selectedStatuses: [],
  from: '',
  to: '',
  sort: 'soonest',
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

describe('SessionsFilters', () => {
  beforeEach(() => {
    pushMock.mockClear()
    mockMatchMedia(true)
  })

  it('renders all applied filter values', () => {
    render(
      <SessionsFilters
        {...defaultProps}
        search='strength'
        trainer='trainer-1'
        selectedStatuses={['completed']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    expect(screen.getByLabelText('Search')).toHaveValue('strength')
    expect(screen.getByRole('button', { name: 'Trainer: Sam Coach' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Session status: Completed' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toHaveValue('2026-07-01')
    expect(screen.getByLabelText('To')).toHaveValue('2026-07-31')
    expect(screen.getByRole('button', { name: 'Sort: Latest first' })).toBeInTheDocument()
  })

  it('applies every supported filter with canonical URL ordering', async () => {
    const user = userEvent.setup()

    render(<SessionsFilters {...defaultProps} />)

    await user.type(screen.getByLabelText('Search'), 'Morning strength')

    await user.click(screen.getByRole('button', { name: 'Trainer: All trainers' }))
    await user.click(screen.getByLabelText('Trainer: Sam Coach'))

    await user.click(screen.getByRole('button', { name: 'Session status: All' }))
    await user.click(screen.getByLabelText('Session status: Completed'))
    await user.click(screen.getByLabelText('Session status: Scheduled'))

    await user.type(screen.getByLabelText('From'), '2026-07-01')
    await user.type(screen.getByLabelText('To'), '2026-07-31')

    await user.click(screen.getByRole('button', { name: 'Sort: Soonest first' }))
    await user.click(screen.getByLabelText('Sort: Latest first'))

    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/sessions?search=Morning+strength&trainer=trainer-1&statuses=scheduled&statuses=completed&from=2026-07-01&to=2026-07-31&sort=latest',
    )
  })

  it('resets page to one by omitting page when filters are applied', async () => {
    const user = userEvent.setup()

    render(<SessionsFilters {...defaultProps} />)

    await user.type(screen.getByLabelText('Search'), 'Yoga')
    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/sessions?search=Yoga')
  })

  it('resets every draft filter and navigates to the base URL', async () => {
    const user = userEvent.setup()

    render(
      <SessionsFilters
        {...defaultProps}
        search='strength'
        trainer='trainer-1'
        selectedStatuses={['scheduled', 'full']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/sessions')
    expect(screen.getByLabelText('Search')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Trainer: All trainers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Session status: All' })).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toHaveValue('')
    expect(screen.getByLabelText('To')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Sort: Soonest first' })).toBeInTheDocument()
  })

  it('toggles multiple statuses independently', async () => {
    const user = userEvent.setup()

    render(<SessionsFilters {...defaultProps} />)

    const statusTrigger = screen.getByRole('button', { name: 'Session status: All' })
    await user.click(statusTrigger)
    await user.click(screen.getByLabelText('Session status: Scheduled'))
    await user.click(screen.getByLabelText('Session status: Full'))

    expect(
      screen.getByRole('button', { name: 'Session status: 2 selected' }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText('Session status: Scheduled'))

    expect(screen.getByRole('button', { name: 'Session status: Full' })).toBeInTheDocument()
  })

  it('toggles the mobile panel and reports active filter groups', async () => {
    const user = userEvent.setup()

    render(
      <SessionsFilters
        {...defaultProps}
        search='strength'
        trainer='trainer-1'
        selectedStatuses={['scheduled', 'full']}
        from='2026-07-01'
        to='2026-07-31'
        sort='latest'
      />,
    )

    const filtersToggle = screen.getByRole('button', {
      name: /^filters\b/i,
      expanded: false,
    })

    expect(filtersToggle).toHaveTextContent('6 active filters')

    await user.click(filtersToggle)
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(filtersToggle)
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('surfaces a trainer options loading error without hiding other controls', () => {
    render(
      <SessionsFilters
        {...defaultProps}
        trainers={[]}
        trainerOptionsError='Database error'
      />,
    )

    expect(screen.getByText('Failed to load trainer options.')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trainer: All trainers' })).toBeInTheDocument()
  })
})
