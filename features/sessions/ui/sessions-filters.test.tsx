import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionsFilters from './sessions-filters'

const pushMock = jest.fn()
let pathnameMock = '/dashboard/sessions'
let searchParamsMock = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}))

const trainers = [
  { id: 'trainer-1', full_name: 'Sam Coach' },
  { id: 'trainer-2', full_name: 'Mia Trainer' },
]

const statusCounts = {
  scheduled: 3,
  in_progress: 1,
  full: 2,
  completed: 5,
  cancelled: 1,
}

describe('SessionsFilters', () => {
  beforeEach(() => {
    pushMock.mockClear()
    pathnameMock = '/dashboard/sessions'
    searchParamsMock = new URLSearchParams()
  })

  it('renders trainer filter, status filter, and actions', () => {
    render(
      <SessionsFilters
        trainer=''
        trainers={trainers}
        selectedStatuses={[]}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.getByRole('option', { name: /all trainers/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /sam coach/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /mia trainer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('applies selected trainer and statuses to the URL', async () => {
    const user = userEvent.setup()

    render(
      <SessionsFilters
        trainer=''
        trainers={trainers}
        selectedStatuses={[]}
        statusCounts={statusCounts}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'trainer-1')
    await user.click(screen.getByRole('button', { name: /status all/i }))
    await user.click(screen.getByLabelText(/scheduled/i))
    await user.click(screen.getByLabelText(/full/i))
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/sessions?trainer=trainer-1&statuses=scheduled&statuses=full',
    )
  })

  it('preserves unrelated existing search params when applying filters', async () => {
    const user = userEvent.setup()
    searchParamsMock = new URLSearchParams('page=2')

    render(
      <SessionsFilters
        trainer=''
        trainers={trainers}
        selectedStatuses={[]}
        statusCounts={statusCounts}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'trainer-2')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/sessions?page=2&trainer=trainer-2')
  })

  it('resets filters and navigates to the base pathname', async () => {
    const user = userEvent.setup()

    render(
      <SessionsFilters
        trainer='trainer-1'
        trainers={trainers}
        selectedStatuses={['scheduled', 'full']}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('trainer-1')
    expect(screen.getByRole('button', { name: /status 2 selected/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/sessions')
    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()
  })

  it('closes the status dropdown on Escape', async () => {
    const user = userEvent.setup()

    render(
      <SessionsFilters
        trainer=''
        trainers={trainers}
        selectedStatuses={[]}
        statusCounts={statusCounts}
      />,
    )

    await user.click(screen.getByRole('button', { name: /status all/i }))

    expect(screen.getByLabelText(/scheduled/i)).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByLabelText(/scheduled/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /status all/i })).toHaveFocus()
  })

  it('syncs draft state when filter props change', () => {
    const { rerender } = render(
      <SessionsFilters
        trainer=''
        trainers={trainers}
        selectedStatuses={[]}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.getByRole('button', { name: /status all/i })).toBeInTheDocument()

    rerender(
      <SessionsFilters
        trainer='trainer-2'
        trainers={trainers}
        selectedStatuses={['completed']}
        statusCounts={statusCounts}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('trainer-2')
    expect(screen.getByRole('button', { name: /status 1 selected/i })).toBeInTheDocument()
  })
})
