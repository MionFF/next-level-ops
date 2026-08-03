import { DashboardOverviewSkeleton } from '@/features/dashboard/ui/dashboard-overview-skeleton'

export default function DashboardLoading() {
  return (
    <div role='status' aria-label='Loading dashboard overview'>
      <span className='sr-only'>Loading dashboard overview...</span>
      <DashboardOverviewSkeleton />
    </div>
  )
}
