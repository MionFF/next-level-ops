'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  derivedSessionStatuses,
  getSessionDisplayBadge,
  type DerivedSessionStatus,
} from '../model/session'

export type SessionalFiltersProps = {
  trainer: string
  trainers: { id: string; full_name: string }[]
  selectedStatuses: DerivedSessionStatus[]
  statusCounts: Partial<Record<DerivedSessionStatus, number>>
}

export default function SessionsFilters({
  trainer,
  trainers,
  selectedStatuses,
  statusCounts,
}: SessionalFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [draftTrainer, setDraftTrainer] = useState(trainer)
  const [draftStatuses, setDraftStatuses] = useState<DerivedSessionStatus[]>(selectedStatuses)

  // Sync draft state when URL changes externally
  const trainerRef = useRef(trainer)
  const statusesRef = useRef(selectedStatuses)
  useEffect(() => {
    if (trainer !== trainerRef.current) {
      setDraftTrainer(trainer)
      trainerRef.current = trainer
    }
    if (
      selectedStatuses.length !== statusesRef.current.length ||
      selectedStatuses.some((s, i) => s !== statusesRef.current[i])
    ) {
      setDraftStatuses(selectedStatuses)
      statusesRef.current = selectedStatuses
    }
  }, [trainer, selectedStatuses])

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (draftTrainer) {
      params.set('trainer', draftTrainer)
    } else {
      params.delete('trainer')
    }

    params.delete('statuses')
    for (const status of draftStatuses) {
      params.append('statuses', status)
    }

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }, [router, pathname, searchParams, draftTrainer, draftStatuses])

  const resetFilters = useCallback(() => {
    setDraftTrainer('')
    setDraftStatuses([])
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])

  return (
    <div className='mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center'>
      <select
        value={draftTrainer}
        onChange={e => setDraftTrainer(e.target.value)}
        disabled={isPending}
        className='w-full md:w-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <option value=''>All trainers</option>
        {trainers.map(t => (
          <option key={t.id} value={t.id}>
            {t.full_name}
          </option>
        ))}
      </select>

      <SessionStatusFilter
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
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPending ? 'Applying…' : 'Apply'}
        </button>

        <button
          onClick={resetFilters}
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Reset
        </button>
      </div>
    </div>
  )
}

type SessionStatusFilterProps = {
  selectedStatuses: DerivedSessionStatus[]
  statusCounts: Partial<Record<DerivedSessionStatus, number>>
  disabled: boolean
  onToggle: (status: DerivedSessionStatus) => void
}

function SessionStatusFilter({
  selectedStatuses,
  statusCounts,
  disabled,
  onToggle,
}: SessionStatusFilterProps) {
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
        className='flex w-full md:w-auto items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed'
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
          {derivedSessionStatuses.map(status => {
            const badge = getSessionDisplayBadge(status)
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
