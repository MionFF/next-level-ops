import type { ReactNode } from 'react'

import { Skeleton } from '@/shared/ui/skeleton'

export function FilterPanelSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className='mb-8 min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]'>
      <div className='flex items-center justify-between gap-4 px-4 py-3 md:hidden'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-3 w-24' />
        </div>
        <Skeleton className='size-5' />
      </div>

      <div className='hidden md:block'>{children}</div>
    </div>
  )
}

export function FilterControlSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className='flex min-w-0 flex-col gap-2'>
      <Skeleton className={wide ? 'h-4 w-28' : 'h-4 w-20'} />
      <Skeleton className='h-10 w-full rounded-[var(--radius-md)]' />
    </div>
  )
}

export function FilterActionsSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`grid min-w-0 grid-cols-2 gap-2 ${className}`}>
      <Skeleton className='h-10 min-w-0 rounded-[var(--radius-md)]' />
      <Skeleton className='h-10 min-w-0 rounded-[var(--radius-md)]' />
    </div>
  )
}

type OperationsListSkeletonProps = {
  columnCount: number
  desktopClassName: string
  mobileListClassName: string
  rowCount?: number
  mobileCardCount?: number
  mobileLineCount?: number
  showHeaderAction?: boolean
}

export function OperationsListSkeleton({
  columnCount,
  desktopClassName,
  mobileListClassName,
  rowCount = 6,
  mobileCardCount = 4,
  mobileLineCount = 4,
  showHeaderAction = true,
}: OperationsListSkeletonProps) {
  const columns = Array.from({ length: columnCount })
  const rows = Array.from({ length: rowCount })
  const cards = Array.from({ length: mobileCardCount })
  const cardLines = Array.from({ length: mobileLineCount })

  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0 space-y-3'>
          <Skeleton className='h-7 w-44 max-w-full' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </div>
        {showHeaderAction && (
          <Skeleton className='h-10 w-full rounded-[var(--radius-md)] sm:w-32' />
        )}
      </div>

      <div
        aria-hidden='true'
        className={`hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] ${desktopClassName}`}
      >
        <table className='min-w-full table-fixed border-collapse'>
          <thead className='bg-[var(--surface-2)]'>
            <tr>
              {columns.map((_, columnIndex) => (
                <th key={columnIndex} className='px-4 py-3'>
                  <Skeleton className={columnIndex % 3 === 0 ? 'h-3 w-20' : 'h-3 w-14'} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, columnIndex) => (
                  <td key={columnIndex} className='px-4 py-4'>
                    <Skeleton className={columnIndex % 3 === 1 ? 'h-4 w-3/4' : 'h-4 w-full'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-hidden='true' className={mobileListClassName}>
        {cards.map((_, cardIndex) => (
          <li
            key={cardIndex}
            className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
          >
            <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
              <div className='min-w-0'>
                <Skeleton className='h-5 w-2/3' />
                <div className='mt-3 space-y-2'>
                  {cardLines.map((__, lineIndex) => (
                    <Skeleton
                      key={lineIndex}
                      className={lineIndex % 3 === 0 ? 'h-4 w-full' : 'h-4 w-4/5'}
                    />
                  ))}
                </div>
                <Skeleton className='mt-3 h-6 w-20' />
              </div>
              <Skeleton className='h-9 w-16' />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function OperationsPaginationSkeleton() {
  return (
    <div className='mt-4 grid min-w-0 gap-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:rounded-[var(--radius-md)] sm:border sm:border-[var(--border)] sm:bg-[var(--surface)] sm:px-4'>
      <Skeleton className='mx-auto h-4 w-32 sm:mx-0' />
      <div className='flex items-center justify-center gap-1 sm:gap-2'>
        <Skeleton className='h-9 w-9 sm:w-14' />
        <Skeleton className='h-9 w-9 sm:w-20' />
        <Skeleton className='h-9 w-14 sm:w-16' />
        <Skeleton className='h-9 w-9 sm:w-14' />
        <Skeleton className='h-9 w-9 sm:w-14' />
      </div>
    </div>
  )
}
