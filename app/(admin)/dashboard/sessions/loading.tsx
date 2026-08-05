import {
  FilterActionsSkeleton,
  FilterControlSkeleton,
  FilterPanelSkeleton,
  OperationsListSkeleton,
  OperationsPaginationSkeleton,
} from '@/shared/ui/skeletons/operations-skeleton'

export default function SessionsLoading() {
  return (
    <div role='status' aria-label='Loading sessions'>
      <span className='sr-only'>Loading sessions...</span>

      <FilterPanelSkeleton>
        <div className='grid min-w-0 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(14rem,2fr)_repeat(5,minmax(8rem,1fr))_auto] 2xl:items-end'>
          <FilterControlSkeleton wide />
          {Array.from({ length: 5 }).map((_, index) => (
            <FilterControlSkeleton key={index} />
          ))}
          <FilterActionsSkeleton className='md:col-span-2 xl:col-span-3 2xl:col-span-1 2xl:flex 2xl:[&>*]:w-28' />
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
