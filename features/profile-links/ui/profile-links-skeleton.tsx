import { Skeleton } from '@/shared/ui/skeleton'

const summaryCards = Array.from({ length: 3 })
const tableColumns = Array.from({ length: 4 })
const tableRows = Array.from({ length: 3 })
const mobileCards = Array.from({ length: 3 })
const previewRows = Array.from({ length: 4 })

function SectionHeaderSkeleton() {
  return (
    <div aria-hidden='true' className='min-w-0 space-y-2'>
      <Skeleton className='h-6 w-36' />
      <Skeleton className='h-4 w-full max-w-xl' />
    </div>
  )
}

function CurrentLinksSkeleton() {
  return (
    <section className='min-w-0 space-y-4'>
      <SectionHeaderSkeleton />

      <div
        aria-hidden='true'
        className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] lg:block'
      >
        <table className='min-w-full table-fixed border-collapse'>
          <thead className='bg-[var(--surface-2)]'>
            <tr>
              {tableColumns.map((_, columnIndex) => (
                <th key={columnIndex} className='px-4 py-3'>
                  <Skeleton className={columnIndex === 3 ? 'ml-auto h-3 w-14' : 'h-3 w-20'} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
            {tableRows.map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-3/4' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-3/4' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-full' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='ml-auto h-9 w-20 rounded-[var(--radius-md)]' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-hidden='true' className='grid min-w-0 gap-3 lg:hidden'>
        {mobileCards.map((_, cardIndex) => (
          <li
            key={cardIndex}
            className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3'
          >
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-4 w-32 max-w-full' />
              </div>

              <div className='space-y-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-4 w-36 max-w-full' />
              </div>

              <div className='space-y-2'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-3 w-44 max-w-full' />
              </div>

              <div className='space-y-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-9 w-20 rounded-[var(--radius-md)]' />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function LinkFormSkeleton() {
  return (
    <div
      aria-hidden='true'
      className='grid min-w-0 gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end'
    >
      <div className='min-w-0 space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full rounded-[var(--radius-md)]' />
      </div>

      <div className='min-w-0 space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full rounded-[var(--radius-md)]' />
      </div>

      <Skeleton className='h-10 w-full rounded-[var(--radius-md)] md:col-span-2 xl:col-span-1 xl:w-28' />
    </div>
  )
}

function PreviewCardSkeleton({ showBadges = false }: { showBadges?: boolean }) {
  return (
    <div
      aria-hidden='true'
      className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]'
    >
      <div className='space-y-2 px-4 pt-3'>
        <Skeleton className='h-4 w-40 max-w-full' />
        <Skeleton className='h-4 w-full max-w-sm' />
      </div>

      <div className='px-4 py-3'>
        <ul className='divide-y divide-[var(--border)]'>
          {previewRows.map((_, rowIndex) => (
            <li key={rowIndex} className='py-2.5 first:pt-0 last:pb-0'>
              <div className='flex min-w-0 items-start justify-between gap-3'>
                <div className='min-w-0 flex-1 space-y-2'>
                  <Skeleton
                    className={rowIndex % 2 === 0 ? 'h-4 w-40 max-w-full' : 'h-4 w-32 max-w-full'}
                  />

                  {showBadges && <Skeleton className='h-3 w-48 max-w-full' />}
                </div>

                {showBadges && (
                  <Skeleton className='h-6 w-16 shrink-0 rounded-[var(--radius-sm)]' />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function ProfileLinksSkeleton() {
  return (
    <section className='min-w-0 space-y-6'>
      <header aria-hidden='true' className='min-w-0 space-y-2'>
        <Skeleton className='h-3 w-28' />
        <Skeleton className='h-8 w-44' />
        <Skeleton className='h-4 w-full max-w-3xl' />
        <Skeleton className='h-4 w-2/3 max-w-xl' />
      </header>

      <div aria-hidden='true' className='grid min-w-0 gap-3 md:grid-cols-3'>
        {summaryCards.map((_, index) => (
          <div
            key={index}
            className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3'
          >
            <Skeleton className='h-4 w-28' />
            <Skeleton className='mt-2 h-8 w-10' />
          </div>
        ))}
      </div>

      <CurrentLinksSkeleton />

      <section className='min-w-0 space-y-4'>
        <SectionHeaderSkeleton />
        <LinkFormSkeleton />

        <div className='grid min-w-0 gap-4 lg:grid-cols-2'>
          <PreviewCardSkeleton />
          <PreviewCardSkeleton showBadges />
        </div>
      </section>
    </section>
  )
}
