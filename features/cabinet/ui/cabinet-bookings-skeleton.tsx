import { OperationsListSkeleton } from '@/shared/ui/skeletons/operations-skeleton'
import { Skeleton } from '@/shared/ui/skeleton'

export function CabinetBookingsSkeleton() {
  return (
    <>
      <OperationsListSkeleton
        columnCount={6}
        desktopClassName='xl:block'
        mobileListClassName='flex min-w-0 flex-col gap-3 xl:hidden'
        rowCount={5}
        mobileCardCount={3}
        mobileLineCount={3}
        showHeaderAction={false}
      />

      <section className='mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
        <div className='mb-6 space-y-3'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </div>
        <div className='grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              aria-hidden='true'
              className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-4'
            >
              <Skeleton className='mx-auto h-7 w-10' />
              <Skeleton className='mx-auto mt-2 h-3 w-20' />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
