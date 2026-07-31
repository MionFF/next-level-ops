import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembersFilters from './members-filters'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

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

describe('MembersFilters', () => {
  beforeEach(() => {
    pushMock.mockClear()

    mockMatchMedia(true)
  })

  it('renders current filter values', () => {
    render(
      <MembersFilters
        search='alex'
        selectedStatuses={['active', 'paused']}
        profile='unlinked'
        selectedMemberships={['expired']}
      />,
    )

    expect(screen.getByLabelText(/search/i)).toHaveValue('alex')
    expect(screen.getByRole('button', { name: /member status: 2 selected/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /profile: unlinked/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /membership: expired/i })).toBeInTheDocument()
  })

  it('applies multiple statuses and memberships to the URL', async () => {
    const user = userEvent.setup()

    render(
      <MembersFilters search='' selectedStatuses={[]} profile='all' selectedMemberships={[]} />,
    )

    await user.type(screen.getByLabelText(/search/i), '555')

    await user.click(screen.getByRole('button', { name: /member status: all/i }))
    await user.click(screen.getByLabelText('Member status: Active'))
    await user.click(screen.getByLabelText('Member status: Paused'))

    await user.click(screen.getByRole('button', { name: /profile: all profiles/i }))
    await user.click(screen.getByLabelText('Profile: Unlinked'))

    await user.click(screen.getByRole('button', { name: /membership: all/i }))
    await user.click(screen.getByLabelText('Membership: Expired'))
    await user.click(screen.getByLabelText('Membership: No membership'))

    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/members?search=555&status=active&status=paused&profile=unlinked&membership=expired&membership=none',
    )
  })

  it('resets page when filters are applied', async () => {
    const user = userEvent.setup()

    render(
      <MembersFilters search='' selectedStatuses={[]} profile='all' selectedMemberships={[]} />,
    )

    await user.click(screen.getByRole('button', { name: /member status: all/i }))
    await user.click(screen.getByLabelText('Member status: Active'))

    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/members?status=active')
  })

  it('resets all draft filters', async () => {
    const user = userEvent.setup()

    render(
      <MembersFilters
        search='alex'
        selectedStatuses={['active']}
        profile='linked'
        selectedMemberships={['active']}
      />,
    )

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/members')
    expect(screen.getByLabelText(/search/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /member status: all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /profile: all profiles/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /membership: all/i })).toBeInTheDocument()
  })

  it('reports applied filter groups on mobile', () => {
    render(
      <MembersFilters
        search='alex'
        selectedStatuses={['active', 'paused']}
        profile='linked'
        selectedMemberships={[]}
      />,
    )

    const filtersToggle = screen.getByRole('button', {
      name: /^filters\b/i,
      expanded: false,
    })

    expect(filtersToggle).toHaveTextContent('3 active filters')
  })
})
