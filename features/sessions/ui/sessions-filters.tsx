'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import {
  derivedSessionStatuses,
  getSessionDisplayBadge,
  type DerivedSessionStatus,
  type SessionSort,
} from '../model/session'
import { isValidSessionDateRange } from '../model/sessions-query'
import { getSessionsHref } from '../model/sessions-url'
import { MultiSelectFilter } from '@/shared/ui/filters/multi-select-filter'
import { SingleSelectFilter } from '@/shared/ui/filters/single-select-filter'

export type SessionsFiltersProps = {
  search: string
  trainer: string
  trainers: { id: string; full_name: string }[]
  selectedStatuses: DerivedSessionStatus[]
  from: string
  to: string
  sort: SessionSort
  trainerOptionsError?: string
}

const sessionStatusOptions = derivedSessionStatuses.map(status => ({
  value: status,
  label: getSessionDisplayBadge(status).text,
}))

const sessionSortOptions = [
  { value: 'soonest', label: 'Soonest first' },
  { value: 'latest', label: 'Latest first' },
] as const

export default function SessionsFilters({
  search,
  trainer,
  trainers,
  selectedStatuses,
  from,
  to,
  sort,
  trainerOptionsError,
}: SessionsFiltersProps) {
  const router = useRouter()
  const panelId = useId()

  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const [draftSearch, setDraftSearch] = useState(search)
  const [draftTrainer, setDraftTrainer] = useState(trainer)
  const [draftStatuses, setDraftStatuses] = useState<DerivedSessionStatus[]>(selectedStatuses)
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const [draftSort, setDraftSort] = useState<SessionSort>(sort)

  const hasInvalidDateRange = !isValidSessionDateRange(draftFrom, draftTo)

  const dateInputClassName = `min-w-0 rounded-[var(--radius-md)] border bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50 ${
    hasInvalidDateRange
      ? 'border-[var(--danger)] focus:border-[var(--danger)]'
      : 'border-[var(--border)] focus:border-[var(--primary)]'
  }`

  const trainerOptions = [
    { value: '', label: 'All trainers' },
    ...trainers.map(option => ({ value: option.id, label: option.full_name })),
  ]

  const activeFilterGroups = [
    search.trim().length > 0,
    trainer.length > 0,
    selectedStatuses.length > 0,
    from.length > 0,
    to.length > 0,
    sort !== 'soonest',
  ].filter(Boolean).length

  function toggleStatus(status: DerivedSessionStatus) {
    setDraftStatuses(current =>
      current.includes(status)
        ? current.filter(currentStatus => currentStatus !== status)
        : [...current, status],
    )
  }

  function applyFilters() {
    if (hasInvalidDateRange) {
      return
    }

    const href = getSessionsHref({
      search: draftSearch,
      trainer: draftTrainer,
      statuses: draftStatuses,
      from: draftFrom,
      to: draftTo,
      sort: draftSort,
      page: 1,
    })

    startTransition(() => {
      router.push(href)
    })
  }

  function resetFilters() {
    setDraftSearch('')
    setDraftTrainer('')
    setDraftStatuses([])
    setDraftFrom('')
    setDraftTo('')
    setDraftSort('soonest')

    startTransition(() => {
      router.push('/dashboard/sessions')
    })
  }

  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        applyFilters()
      }}
      className='relative z-10 mb-8 min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]'
    >
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(current => !current)}
        className='flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]/40 md:hidden'
      >
        <span className='min-w-0'>
          <span className='block font-semibold text-[var(--foreground)]'>Filters</span>

          <span className='mt-0.5 block text-xs text-[var(--muted)]'>
            {activeFilterGroups === 0
              ? 'No active filters'
              : `${activeFilterGroups} active ${activeFilterGroups === 1 ? 'filter' : 'filters'}`}
          </span>
        </span>

        <svg
          aria-hidden='true'
          viewBox='0 0 20 20'
          fill='none'
          className={`size-5 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d='m5 7.5 5 5 5-5'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none md:grid-rows-[1fr] md:opacity-100 ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div
          className={`min-h-0 overflow-hidden md:overflow-visible ${
            isOpen ? 'visible' : 'invisible md:visible'
          }`}
        >
          <div className='grid min-w-0 gap-4 border-t border-[var(--border)] p-4 md:grid-cols-2 md:border-t-0 md:p-6 xl:grid-cols-3 2xl:grid-cols-[minmax(14rem,2fr)_repeat(5,minmax(8rem,1fr))_auto] 2xl:items-end'>
            <label htmlFor='sessions-search' className='flex min-w-0 flex-col gap-2'>
              <span className='font-medium'>Search</span>

              <input
                type='search'
                id='sessions-search'
                value={draftSearch}
                disabled={isPending}
                onChange={event => setDraftSearch(event.target.value)}
                placeholder='Search by title'
                className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
              />
            </label>

            <div className='relative z-30 min-w-0'>
              <SingleSelectFilter
                label='Trainer'
                name='trainer-filter'
                options={trainerOptions}
                value={draftTrainer}
                disabled={isPending}
                onChange={setDraftTrainer}
              />
            </div>

            <div className='relative z-20 min-w-0'>
              <MultiSelectFilter
                label='Session status'
                options={sessionStatusOptions}
                selectedValues={draftStatuses}
                disabled={isPending}
                onToggle={toggleStatus}
              />
            </div>

            <label htmlFor='sessions-from' className='flex min-w-0 flex-col gap-2'>
              <span className='font-medium'>From</span>

              <input
                type='date'
                id='sessions-from'
                value={draftFrom}
                disabled={isPending}
                onChange={event => setDraftFrom(event.target.value)}
                aria-invalid={hasInvalidDateRange}
                aria-describedby={hasInvalidDateRange ? 'sessions-date-range-error' : undefined}
                className={dateInputClassName}
              />
            </label>

            <label htmlFor='sessions-to' className='flex min-w-0 flex-col gap-2'>
              <span className='font-medium'>To</span>

              <input
                type='date'
                id='sessions-to'
                value={draftTo}
                disabled={isPending}
                onChange={event => setDraftTo(event.target.value)}
                aria-invalid={hasInvalidDateRange}
                aria-describedby={hasInvalidDateRange ? 'sessions-date-range-error' : undefined}
                className={dateInputClassName}
              />
            </label>

            <div className='relative z-10 min-w-0'>
              <SingleSelectFilter
                label='Sort'
                name='sessions-sort'
                options={sessionSortOptions}
                value={draftSort}
                disabled={isPending}
                onChange={setDraftSort}
              />
            </div>

            <div className='grid min-w-0 grid-cols-2 gap-2 md:col-span-2 xl:col-span-3 2xl:col-span-1 2xl:flex'>
              <button
                type='submit'
                disabled={isPending || hasInvalidDateRange}
                className='min-w-0 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50 2xl:flex-none'
              >
                {isPending ? 'Applying…' : 'Apply filters'}
              </button>

              <button
                type='button'
                disabled={isPending}
                onClick={resetFilters}
                className='min-w-0 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-center font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 2xl:flex-none'
              >
                Reset
              </button>
            </div>
          </div>

          {hasInvalidDateRange && (
            <p
              id='sessions-date-range-error'
              role='alert'
              className='mx-4 mb-4 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)] md:mx-6 md:mb-6'
            >
              From date must be on or before To date.
            </p>
          )}

          {trainerOptionsError && (
            <p
              role='status'
              className='mx-4 mb-4 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)] md:mx-6 md:mb-6'
            >
              Failed to load trainer options.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
