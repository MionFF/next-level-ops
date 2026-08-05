import { render, screen } from '@testing-library/react'

import Dashboard from './page'

jest.mock('@/features/dashboard/ui/dashboard-summary', () => {
  const pendingSummary = new Promise(() => {})

  return {
    DashboardSummary() {
      throw pendingSummary
    },
  }
})

describe('Dashboard page streaming boundary', () => {
  it('shows the summary fallback while real Quick Actions remain available', () => {
    render(<Dashboard />)

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('link', { name: /New member/ })).toHaveAttribute(
      'href',
      '/dashboard/members/new',
    )
  })
})
