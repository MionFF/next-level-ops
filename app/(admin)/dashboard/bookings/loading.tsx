import {
  FilterActionsSkeleton,
  FilterControlSkeleton,
  FilterPanelSkeleton,
  OperationsListSkeleton,
  OperationsPaginationSkeleton,
} from '@/shared/ui/skeletons/operations-skeleton'

export default function BookingsLoading() {
  return (
    <div role='status' aria-label='Loading bookings'>
      <span className='sr-only'>Loading bookings...</span>

      <FilterPanelSkeleton>
        <div className='grid min-w-0 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3'>
          <FilterControlSkeleton wide />
          <FilterControlSkeleton wide />
          {Array.from({ length: 4 }).map((_, index) => (
            <FilterControlSkeleton key={index} />
          ))}
        </div>
        <div className='flex min-w-0 gap-4 border-t border-[var(--border)] bg-[var(--surface-2)]/20 px-6 py-4 md:items-end md:justify-between'>
          <div className='w-full max-w-xs'>
            <FilterControlSkeleton />
          </div>
          <FilterActionsSkeleton className='w-60 shrink-0 [&>*]:w-full' />
        </div>
      </FilterPanelSkeleton>

      <OperationsListSkeleton
        columnCount={8}
        desktopClassName='min-[1470px]:block'
        mobileListClassName='flex min-w-0 flex-col gap-3 min-[1470px]:hidden'
        rowCount={6}
        mobileCardCount={4}
        mobileLineCount={5}
      />

      <OperationsPaginationSkeleton />
    </div>
  )
}
