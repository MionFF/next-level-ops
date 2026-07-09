import { render, screen, within } from '@testing-library/react'
import { MemberMembershipSection } from './member-membership-section'
import type { MemberMembership, MemberMembershipPlanOption } from '../model/member-membership'

jest.mock('../actions/assign-member-membership', () => ({
  assignMemberMembership: jest.fn(),
}))

jest.mock('../actions/cancel-member-membership', () => ({
  cancelMemberMembership: jest.fn(),
}))

const activePlans: MemberMembershipPlanOption[] = [
  {
    id: 'plan-monthly',
    name: 'Monthly Unlimited',
    duration_days: 30,
  },
]

function createMembership(overrides: Partial<MemberMembership>): MemberMembership {
  return {
    id: 'membership-1',
    starts_at: '2026-07-08T00:00:00.000Z',
    ends_at: '2026-08-07T00:00:00.000Z',
    stored_status: 'active',
    derived_status: 'active',
    plan: {
      id: 'plan-monthly',
      name: 'Monthly Unlimited',
      duration_days: 30,
      price_cents: 9900,
    },
    ...overrides,
  }
}

function renderSection(
  overrides: Partial<React.ComponentProps<typeof MemberMembershipSection>> = {},
) {
  render(
    <MemberMembershipSection
      memberId='member-1'
      memberships={[]}
      activePlans={activePlans}
      {...overrides}
    />,
  )
}

function getSectionByHeading(name: RegExp) {
  const heading = screen.getByRole('heading', { name })
  const section = heading.closest('section')

  if (!(section instanceof HTMLElement)) {
    throw new Error(`Expected section for heading ${String(name)}`)
  }

  return section
}

describe('MemberMembershipSection', () => {
  it('renders no active membership and no history states', () => {
    renderSection()

    expect(screen.getByRole('heading', { name: /^membership$/i })).toBeInTheDocument()
    expect(screen.getByText('No active membership.')).toBeInTheDocument()
    expect(screen.getByText('No membership history.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /assign membership/i })).toBeInTheDocument()
  })

  it('renders current membership details', () => {
    renderSection({
      memberships: [
        createMembership({
          id: 'active-membership',
          derived_status: 'active',
          starts_at: '2026-07-08T00:00:00.000Z',
          ends_at: '2026-08-07T00:00:00.000Z',
        }),
      ],
    })

    const currentSection = getSectionByHeading(/current membership/i)

    expect(within(currentSection).getAllByText('Monthly Unlimited').length).toBeGreaterThan(0)
    expect(within(currentSection).getAllByText('Jul 8, 2026').length).toBeGreaterThan(0)
    expect(within(currentSection).getAllByText('Aug 7, 2026').length).toBeGreaterThan(0)
    expect(within(currentSection).getAllByText('Active').length).toBeGreaterThan(0)
  })

  it('renders membership history statuses', () => {
    renderSection({
      memberships: [
        createMembership({
          id: 'active-membership',
          derived_status: 'active',
        }),
        createMembership({
          id: 'upcoming-membership',
          starts_at: '2026-08-07T00:00:00.000Z',
          ends_at: '2026-09-06T00:00:00.000Z',
          derived_status: 'upcoming',
        }),
        createMembership({
          id: 'expired-membership',
          starts_at: '2026-05-01T00:00:00.000Z',
          ends_at: '2026-06-01T00:00:00.000Z',
          derived_status: 'expired',
        }),
        createMembership({
          id: 'cancelled-membership',
          starts_at: '2026-06-01T00:00:00.000Z',
          ends_at: '2026-07-01T00:00:00.000Z',
          stored_status: 'cancelled',
          derived_status: 'cancelled',
        }),
      ],
    })

    const historySection = getSectionByHeading(/membership history/i)

    expect(within(historySection).getAllByText('Active').length).toBeGreaterThan(0)
    expect(within(historySection).getAllByText('Upcoming').length).toBeGreaterThan(0)
    expect(within(historySection).getAllByText('Expired').length).toBeGreaterThan(0)
    expect(within(historySection).getAllByText('Cancelled').length).toBeGreaterThan(0)
  })

  it('renders renewal form copy when there is a current active membership', () => {
    renderSection({
      memberships: [
        createMembership({
          id: 'active-membership',
          derived_status: 'active',
          ends_at: '2026-08-07T00:00:00.000Z',
        }),
      ],
    })

    expect(screen.getByRole('heading', { name: /renew membership/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2026-08-07')
    expect(screen.getByRole('button', { name: /renew membership/i })).toBeInTheDocument()
  })

  it('renders disabled assign form when there are no active plans', () => {
    renderSection({
      activePlans: [],
    })

    expect(screen.getByLabelText(/plan/i)).toBeDisabled()
    expect(screen.getByLabelText(/start date/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /assign membership/i })).toBeDisabled()
    expect(screen.getByText(/no active membership plans available/i)).toBeInTheDocument()
  })

  it('renders cancel controls for active and upcoming memberships', () => {
    renderSection({
      memberships: [
        createMembership({
          id: 'active-membership',
          derived_status: 'active',
        }),
        createMembership({
          id: 'upcoming-membership',
          starts_at: '2026-08-07T00:00:00.000Z',
          ends_at: '2026-09-06T00:00:00.000Z',
          derived_status: 'upcoming',
        }),
      ],
    })

    expect(screen.getAllByRole('button', { name: /cancel/i }).length).toBeGreaterThan(0)
  })

  it('does not render cancel controls for expired or cancelled memberships', () => {
    renderSection({
      memberships: [
        createMembership({
          id: 'expired-membership',
          starts_at: '2026-05-01T00:00:00.000Z',
          ends_at: '2026-06-01T00:00:00.000Z',
          derived_status: 'expired',
        }),
        createMembership({
          id: 'cancelled-membership',
          starts_at: '2026-06-01T00:00:00.000Z',
          ends_at: '2026-07-01T00:00:00.000Z',
          stored_status: 'cancelled',
          derived_status: 'cancelled',
        }),
      ],
    })

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })
})
