import { render, screen, within } from '@testing-library/react'

import { DashboardQuickActions, DashboardSummaryCards } from './overview-cards'

describe('DashboardSummaryCards', () => {
  it('maps summary values to the five overview cards and links', () => {
    render(
      <DashboardSummaryCards
        summary={{
          totalMembers: 11,
          totalTrainers: 7,
          activePlans: 5,
          upcomingSessions: 13,
          confirmedBookings: 29,
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()

    const cards = [
      ['Members', '11', 'View members', '/dashboard/members'],
      ['Trainers', '7', 'View trainers', '/dashboard/trainers'],
      ['Active plans', '5', 'View plans', '/dashboard/plans'],
      ['Upcoming sessions', '13', 'View sessions', '/dashboard/sessions'],
      ['Confirmed bookings', '29', 'View bookings', '/dashboard/bookings'],
    ] as const

    for (const [label, value, linkLabel, href] of cards) {
      const card = screen.getByText(label).parentElement

      if (!card) {
        throw new Error(`Missing summary card for ${label}`)
      }

      expect(within(card).getByText(value)).toBeInTheDocument()
      expect(within(card).getByRole('link', { name: new RegExp(linkLabel) })).toHaveAttribute(
        'href',
        href,
      )
    }
  })
})

describe('DashboardQuickActions', () => {
  it('renders the five existing quick-action links', () => {
    render(<DashboardQuickActions />)

    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument()

    const links = [
      ['New member', '/dashboard/members/new'],
      ['New trainer', '/dashboard/trainers/new'],
      ['New plan', '/dashboard/plans/new'],
      ['New session', '/dashboard/sessions/new'],
      ['New booking', '/dashboard/bookings/new'],
    ] as const

    expect(screen.getAllByRole('link')).toHaveLength(5)

    for (const [label, href] of links) {
      expect(screen.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href)
    }
  })
})
