import { render, screen } from '@testing-library/react'
import type { MembershipPlan } from '../model/membership-plan'
import MembershipPlansList from './membership-plans-list'

const plans: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: 'Monthly Unlimited',
    description: 'Full access to all classes',
    duration_days: 30,
    price_cents: 9900,
    status: 'active',
    created_at: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'plan-2',
    name: 'Drop-in',
    description: null,
    duration_days: 1,
    price_cents: 2500,
    status: 'inactive',
    created_at: '2026-05-21T10:00:00.000Z',
  },
]

describe('MembershipPlansList', () => {
  it('renders error state when membership plans fail to load', () => {
    render(<MembershipPlansList plans={[]} errorMessage='Database error' />)

    expect(screen.getByText('Failed to load membership plans.')).toBeInTheDocument()
    expect(screen.queryByText('No membership plans found.')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no membership plans', () => {
    render(<MembershipPlansList plans={[]} errorMessage={undefined} />)

    expect(screen.getByText('No membership plans found.')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load membership plans.')).not.toBeInTheDocument()
  })

  it('renders membership plan data and primary actions', () => {
    render(<MembershipPlansList plans={plans} errorMessage={undefined} />)

    expect(screen.getByRole('heading', { name: /membership plans/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add plan/i })).toHaveAttribute(
      'href',
      '/dashboard/plans/new',
    )

    expect(screen.getAllByText('Monthly Unlimited').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Full access to all classes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('30 days').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$99.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Drop-in').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1 days').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$25.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
  })

  it('renders fallback values and edit links', () => {
    render(<MembershipPlansList plans={plans} errorMessage={undefined} />)

    expect(screen.getByText('No description')).toBeInTheDocument()

    expect(screen.getAllByRole('link', { name: /edit/i })[0]).toHaveAttribute(
      'href',
      '/dashboard/plans/plan-1/edit',
    )

    expect(screen.getAllByRole('link', { name: /edit/i })[1]).toHaveAttribute(
      'href',
      '/dashboard/plans/plan-2/edit',
    )
  })
})
