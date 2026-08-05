import {
  FilterActionsSkeleton,
  FilterControlSkeleton,
  FilterPanelSkeleton,
  OperationsListSkeleton,
  OperationsPaginationSkeleton,
} from '@/shared/ui/skeletons/operations-skeleton'

export default function MembersLoading() {
  return (
    <div role='status' aria-label='Loading members'>
      <span className='sr-only'>Loading members...</span>

      <FilterPanelSkeleton>
        <div className='grid min-w-0 gap-4 p-6 md:grid-cols-2 2xl:grid-cols-[minmax(16rem,2fr)_repeat(3,minmax(9rem,1fr))_auto] 2xl:items-end'>
          <FilterControlSkeleton wide />
          <FilterControlSkeleton />
          <FilterControlSkeleton />
          <FilterControlSkeleton />
          <FilterActionsSkeleton className='md:col-span-2 2xl:col-span-1 2xl:flex 2xl:[&>*]:w-28' />
        </div>
      </FilterPanelSkeleton>

      <OperationsListSkeleton
        columnCount={7}
        desktopClassName='min-[1440px]:block'
        mobileListClassName='grid min-w-0 gap-3 md:grid-cols-2 min-[1440px]:hidden'
        rowCount={6}
        mobileCardCount={4}
        mobileLineCount={4}
      />

      <OperationsPaginationSkeleton />
    </div>
  )
}
