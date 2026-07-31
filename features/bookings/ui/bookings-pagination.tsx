import Link from 'next/link'
import type { BookingSort, DerivedBookingStatus } from '../model/booking'
import { getBookingsHref } from '../model/bookings-url'

type BookingsPaginationProps = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  member: string
  session: string
  trainer: string
  statuses: DerivedBookingStatus[]
  from: string
  to: string
  sort: BookingSort
}

type PaginationDirection = 'first' | 'previous' | 'next' | 'last'

type PaginationControlProps = {
  href: string
  label: string
  direction: PaginationDirection
}

type DisabledPaginationControlProps = {
  label: string
  direction: PaginationDirection
}

function PaginationIcon({ direction }: { direction: PaginationDirection }) {
  if (direction === 'first') {
    return (
      <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='size-4'>
        <path
          d='M5 4v12M15 5l-5 5 5 5'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }

  if (direction === 'previous') {
    return (
      <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='size-4'>
        <path
          d='M12.5 5l-5 5 5 5'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }

  if (direction === 'next') {
    return (
      <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='size-4'>
        <path
          d='M7.5 5l5 5-5 5'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='size-4'>
      <path
        d='M15 4v12M5 5l5 5-5 5'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function PaginationLink({ href, label, direction }: PaginationControlProps) {
  return (
    <Link
      href={href}
      aria-label={`${label} page`}
      className='inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 sm:min-w-0 sm:px-3'
    >
      <span className='sm:hidden'>
        <PaginationIcon direction={direction} />
      </span>

      <span className='hidden sm:inline'>{label}</span>
    </Link>
  )
}

function DisabledPaginationControl({ label, direction }: DisabledPaginationControlProps) {
  return (
    <span
      role='link'
      aria-label={`${label} page`}
      aria-disabled='true'
      className='inline-flex min-h-9 min-w-9 cursor-default select-none items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1.5 text-sm font-medium text-[var(--muted)] opacity-45 sm:min-w-0 sm:px-3'
    >
      <span className='sm:hidden'>
        <PaginationIcon direction={direction} />
      </span>

      <span className='hidden sm:inline'>{label}</span>
    </span>
  )
}

export default function BookingsPagination({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  member,
  session,
  trainer,
  statuses,
  from,
  to,
  sort,
}: BookingsPaginationProps) {
  const firstResult = (currentPage - 1) * pageSize + 1
  const lastResult = Math.min(currentPage * pageSize, totalCount)

  const getPageHref = (page: number) =>
    getBookingsHref({
      member,
      session,
      trainer,
      statuses,
      from,
      to,
      sort,
      page,
    })

  const firstHref = getPageHref(1)
  const previousHref = getPageHref(currentPage - 1)
  const nextHref = getPageHref(currentPage + 1)
  const lastHref = getPageHref(totalPages)

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <nav
      aria-label='Bookings pagination'
      className='mt-4 grid min-w-0 gap-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:rounded-[var(--radius-md)] sm:border sm:border-[var(--border)] sm:bg-[var(--surface)] sm:px-4'
    >
      <p className='text-center text-sm text-[var(--muted)] sm:text-left'>
        Showing{' '}
        <span className='font-medium text-[var(--foreground)]'>
          {firstResult}–{lastResult}
        </span>{' '}
        of <span className='font-medium text-[var(--foreground)]'>{totalCount}</span>
      </p>

      <div className='flex min-w-0 items-center justify-center gap-1 sm:gap-2'>
        {isFirstPage ? (
          <>
            <DisabledPaginationControl label='First' direction='first' />
            <DisabledPaginationControl label='Previous' direction='previous' />
          </>
        ) : (
          <>
            <PaginationLink href={firstHref} label='First' direction='first' />
            <PaginationLink href={previousHref} label='Previous' direction='previous' />
          </>
        )}

        <span
          aria-current='page'
          aria-label={`Page ${currentPage} of ${totalPages}`}
          className='inline-flex min-h-9 min-w-14 cursor-default select-none items-center justify-center rounded-[var(--radius-sm)] border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2 py-1.5 text-sm font-semibold text-[var(--foreground)] sm:min-w-16 sm:px-3'
        >
          {currentPage} of {totalPages}
        </span>

        {isLastPage ? (
          <>
            <DisabledPaginationControl label='Next' direction='next' />
            <DisabledPaginationControl label='Last' direction='last' />
          </>
        ) : (
          <>
            <PaginationLink href={nextHref} label='Next' direction='next' />
            <PaginationLink href={lastHref} label='Last' direction='last' />
          </>
        )}
      </div>
    </nav>
  )
}
