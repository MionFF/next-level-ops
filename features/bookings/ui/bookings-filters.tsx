'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  derivedBookingStatuses,
  getBookingDisplayBadge,
  type DerivedBookingStatus,
} from '../model/booking'

type BookingsFiltersProps = {
  member: string
  session: string
  selectedStatuses: DerivedBookingStatus[]
  statusCounts: Partial<Record<DerivedBookingStatus, number>>
}

export default function BookingsFilters({
  member,
  session,
  selectedStatuses,
  statusCounts,
}: BookingsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local draft state, synchronized from URL params
  const [draftMember, setDraftMember] = useState(member)
  const [draftSession, setDraftSession] = useState(session)
  const [draftStatuses, setDraftStatuses] = useState<DerivedBookingStatus[]>(selectedStatuses)

  // Sync draft state when URL changes externally
  const memberRef = useRef(member)
  const sessionRef = useRef(session)
  const statusesRef = useRef(selectedStatuses)
  useEffect(() => {
    if (member !== memberRef.current) {
      setDraftMember(member)
      memberRef.current = member
    }
    if (session !== sessionRef.current) {
      setDraftSession(session)
      sessionRef.current = session
    }
    if (
      selectedStatuses.length !== statusesRef.current.length ||
      selectedStatuses.some((s, i) => s !== statusesRef.current[i])
    ) {
      setDraftStatuses(selectedStatuses)
      statusesRef.current = selectedStatuses
    }
  }, [member, session, selectedStatuses])

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (draftMember.trim()) {
      params.set('member', draftMember.trim())
    } else {
      params.delete('member')
    }

    if (draftSession.trim()) {
      params.set('session', draftSession.trim())
    } else {
      params.delete('session')
    }

    params.delete('statuses')
    for (const status of draftStatuses) {
      params.append('statuses', status)
    }

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }, [router, pathname, searchParams, draftMember, draftSession, draftStatuses])

  const resetFilters = useCallback(() => {
    setDraftMember('')
    setDraftSession('')
    setDraftStatuses([])
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        applyFilters()
      }
    },
    [applyFilters],
  )

  return (
    <div className='mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center'>
      <input
        type='text'
        value={draftMember}
        onChange={e => setDraftMember(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        placeholder='Member name or email…'
        className='w-full md:w-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed'
      />

      <input
        type='text'
        value={draftSession}
        onChange={e => setDraftSession(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        placeholder='Session title…'
        className='w-full md:w-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed'
      />

      <BookingsStatusFilter
        selectedStatuses={draftStatuses}
        statusCounts={statusCounts}
        disabled={isPending}
        onToggle={status => {
          setDraftStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status],
          )
        }}
      />

      <div className='flex gap-2'>
        <button
          onClick={applyFilters}
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] cursor-pointer transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPending ? 'Applying…' : 'Apply'}
        </button>

        <button
          onClick={resetFilters}
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Reset
        </button>
      </div>
    </div>
  )
}

type BookingsStatusFilterProps = {
  selectedStatuses: DerivedBookingStatus[]
  statusCounts: Partial<Record<DerivedBookingStatus, number>>
  disabled: boolean
  onToggle: (status: DerivedBookingStatus) => void
}

function BookingsStatusFilter({
  selectedStatuses,
  statusCounts,
  disabled,
  onToggle,
}: BookingsStatusFilterProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [open])

  // Close on Escape and return focus to trigger
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const isAll = selectedStatuses.length === 0
  const label = isAll ? 'All' : `${selectedStatuses.length} selected`

  return (
    <div ref={containerRef} className='relative w-full md:w-auto'>
      <button
        ref={triggerRef}
        type='button'
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className='flex w-full md:w-auto items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] cursor-pointer transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <span className='font-medium'>Status</span>
        <span className='text-[var(--muted)]'>{label}</span>
        <svg
          className={`ml-auto md:ml-0 size-3 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {open && (
        <div className='static mt-1 w-full md:absolute md:left-0 md:right-auto md:z-20 md:min-w-[200px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg'>
          {derivedBookingStatuses.map(status => {
            const badge = getBookingDisplayBadge(status)
            const count = statusCounts[status]
            const checked = selectedStatuses.includes(status)

            return (
              <label
                key={status}
                className='flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--surface-2)]'
              >
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={() => onToggle(status)}
                  className='size-3.5 accent-[var(--primary)]'
                />
                <span
                  className={`inline-flex rounded-[var(--radius-sm)] border bg-[var(--surface-2)] px-1.5 py-0.5 text-xs font-medium capitalize ${badge.className}`}
                >
                  {badge.text}
                </span>
                {count !== undefined && (
                  <span className='ml-auto text-xs tabular-nums text-[var(--muted)]'>{count}</span>
                )}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
