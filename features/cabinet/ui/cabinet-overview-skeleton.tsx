import { Skeleton } from '@/shared/ui/skeleton'

function DetailRowsSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden='true' className='rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='border-b border-[var(--border)] py-4 last:border-b-0'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className={index % 2 === 0 ? 'mt-2 h-4 w-48' : 'mt-2 h-4 w-64'} />
        </div>
      ))}
    </div>
  )
}

export function CabinetOverviewSkeleton() {
  return (
    <>
      <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
        <div className='mb-6 space-y-3'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </div>
        <Skeleton className='mb-3 h-6 w-48' />
        <DetailRowsSkeleton count={4} />
      </section>

      <section className='mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
        <Skeleton className='mb-3 h-6 w-44' />
        <DetailRowsSkeleton count={4} />
      </section>
    </>
  )
}
