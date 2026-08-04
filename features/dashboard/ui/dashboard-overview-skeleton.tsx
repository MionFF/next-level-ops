import { Skeleton } from '@/shared/ui/skeleton'

const dashboardCardPlaceholders = Array.from({ length: 5 })

function DashboardCardSkeleton({ summary = false }: { summary?: boolean }) {
  return (
    <div
      aria-hidden='true'
      className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5'
    >
      <Skeleton className='h-3 w-24' />
      <Skeleton className={summary ? 'mt-3 h-9 w-16' : 'mt-3 h-5 w-28'} />
      <Skeleton className='mt-4 h-4 w-24' />
    </div>
  )
}

export function DashboardSummarySkeleton() {
  return (
    <section>
      <h2 className='mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
        Overview
      </h2>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {dashboardCardPlaceholders.map((_, index) => (
          <DashboardCardSkeleton key={index} summary />
        ))}
      </div>
    </section>
  )
}

function DashboardQuickActionsSkeleton() {
  return (
    <section>
      <h2 className='mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
        Quick actions
      </h2>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {dashboardCardPlaceholders.map((_, index) => (
          <DashboardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

export function DashboardOverviewSkeleton() {
  return (
    <div className='space-y-8'>
      <DashboardSummarySkeleton />
      <DashboardQuickActionsSkeleton />
    </div>
  )
}
