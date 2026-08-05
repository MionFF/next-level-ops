import { Suspense } from 'react'

import { DashboardSummarySkeleton } from '@/features/dashboard/ui/dashboard-overview-skeleton'
import { DashboardQuickActions } from '@/features/dashboard/ui/overview-cards'
import { DashboardSummary } from '@/features/dashboard/ui/dashboard-summary'

export default function Dashboard() {
  return (
    <div className='space-y-8'>
      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummary />
      </Suspense>

      <DashboardQuickActions />
    </div>
  )
}
