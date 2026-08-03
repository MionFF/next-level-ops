import { render, screen } from '@testing-library/react'

import DashboardLoading from '@/app/(admin)/dashboard/loading'
import BookingsLoading from '@/app/(admin)/dashboard/bookings/loading'
import MembersLoading from '@/app/(admin)/dashboard/members/loading'
import ProfileLinksLoading from '@/app/(admin)/dashboard/profile-links/loading'
import PlansLoading from '@/app/(admin)/dashboard/plans/loading'
import SessionsLoading from '@/app/(admin)/dashboard/sessions/loading'
import TrainersLoading from '@/app/(admin)/dashboard/trainers/loading'
import CabinetLoading from '@/app/(client)/cabinet/loading'
import CabinetBookingsLoading from '@/app/(client)/cabinet/bookings/loading'

const routeLoadingStates = [
  ['dashboard overview', DashboardLoading],
  ['members', MembersLoading],
  ['profile links', ProfileLinksLoading],
  ['trainers', TrainersLoading],
  ['membership plans', PlansLoading],
  ['sessions', SessionsLoading],
  ['bookings', BookingsLoading],
  ['cabinet overview', CabinetLoading],
  ['cabinet bookings', CabinetBookingsLoading],
] as const

describe('route loading states', () => {
  it.each(routeLoadingStates)(
    'exposes one status for %s without interactive controls',
    (name, Loading) => {
      render(<Loading />)

      expect(screen.getByRole('status', { name: `Loading ${name}` })).toBeInTheDocument()
      expect(screen.queryAllByRole('status')).toHaveLength(1)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    },
  )

  it('keeps both dashboard overview section headings visible', () => {
    render(<DashboardLoading />)

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument()
  })
})
