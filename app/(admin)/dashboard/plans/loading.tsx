import { OperationsListSkeleton } from '@/shared/ui/skeletons/operations-skeleton'

export default function PlansLoading() {
  return (
    <div role='status' aria-label='Loading membership plans'>
      <span className='sr-only'>Loading membership plans...</span>
      <OperationsListSkeleton
        columnCount={7}
        desktopClassName='xl:block'
        mobileListClassName='flex min-w-0 flex-col gap-3 xl:hidden'
        rowCount={6}
        mobileCardCount={4}
      />
    </div>
  )
}
