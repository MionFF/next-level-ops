import Link from 'next/link'
import type { MemberStatus, MembershipOperationalStatus, ProfileLinkFilter } from '../model/member'
import { getMembersHref } from '../model/members-url'

type MembersPaginationProps = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  search: string
  statuses: MemberStatus[]
  profile: ProfileLinkFilter
  memberships: MembershipOperationalStatus[]
}

type PaginationControlProps = {
  href: string
  children: React.ReactNode
}

function PaginationLink({ href, children }: PaginationControlProps) {
  return (
    <Link
      href={href}
      className='inline-flex min-h-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40'
    >
      {children}
    </Link>
  )
}

function DisabledPaginationControl({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-disabled='true'
      className='inline-flex min-h-9 cursor-default select-none items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--muted)] opacity-45'
    >
      {children}
    </span>
  )
}

export default function MembersPagination({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  search,
  statuses,
  profile,
  memberships,
}: MembersPaginationProps) {
  const firstResult = (currentPage - 1) * pageSize + 1
  const lastResult = Math.min(currentPage * pageSize, totalCount)

  const firstHref = getMembersHref({
    page: 1,
    search,
    statuses,
    profile,
    memberships,
  })

  const previousHref = getMembersHref({
    page: currentPage - 1,
    search,
    statuses,
    profile,
    memberships,
  })

  const nextHref = getMembersHref({
    page: currentPage + 1,
    search,
    statuses,
    profile,
    memberships,
  })

  const lastHref = getMembersHref({
    page: totalPages,
    search,
    statuses,
    profile,
    memberships,
  })

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <nav
      aria-label='Members pagination'
      className='mt-4 grid gap-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:rounded-[var(--radius-md)] sm:border sm:border-[var(--border)] sm:bg-[var(--surface)] sm:px-4'
    >
      <p className='text-center text-sm text-[var(--muted)] sm:text-left'>
        Showing{' '}
        <span className='font-medium text-[var(--foreground)]'>
          {firstResult}–{lastResult}
        </span>{' '}
        of <span className='font-medium text-[var(--foreground)]'>{totalCount}</span>
      </p>

      <div className='flex flex-wrap items-center justify-center gap-2'>
        {isFirstPage ? (
          <>
            <DisabledPaginationControl>First</DisabledPaginationControl>
            <DisabledPaginationControl>Previous</DisabledPaginationControl>
          </>
        ) : (
          <>
            <PaginationLink href={firstHref}>First</PaginationLink>
            <PaginationLink href={previousHref}>Previous</PaginationLink>
          </>
        )}

        <span
          aria-current='page'
          className='inline-flex min-h-9 min-w-16 cursor-default select-none items-center justify-center rounded-[var(--radius-sm)] border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--foreground)]'
        >
          {currentPage} of {totalPages}
        </span>

        {isLastPage ? (
          <>
            <DisabledPaginationControl>Next</DisabledPaginationControl>
            <DisabledPaginationControl>Last</DisabledPaginationControl>
          </>
        ) : (
          <>
            <PaginationLink href={nextHref}>Next</PaginationLink>
            <PaginationLink href={lastHref}>Last</PaginationLink>
          </>
        )}
      </div>
    </nav>
  )
}
