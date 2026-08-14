'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  derivedBookingStatuses,
  getBookingDisplayBadge,
  type BookingSort,
  type DerivedBookingStatus,
} from '../model/booking'
import { isValidBookingDateRange } from '../model/bookings-query'
import { getBookingsHref } from '../model/bookings-url'
import { MultiSelectFilter } from '@/shared/ui/filters/multi-select-filter'
import { OperationsFilterPanel } from '@/shared/ui/filters/operations-filter-panel'
import { SingleSelect } from '@/shared/ui/single-select'

export type BookingsFiltersProps = {
  member: string
  session: string
  trainer: string
  trainers: { id: string; full_name: string }[]
  selectedStatuses: DerivedBookingStatus[]
  from: string
  to: string
  sort: BookingSort
  trainerOptionsError?: string
}

const bookingStatusOptions = derivedBookingStatuses.map(status => ({
  value: status,
  label: getBookingDisplayBadge(status).text,
}))

const bookingSortOptions = [
  { value: 'upcoming', label: 'Upcoming first' },
  { value: 'soonest', label: 'Soonest first' },
  { value: 'latest', label: 'Latest first' },
] as const

export default function BookingsFilters({
  member,
  session,
  trainer,
  trainers,
  selectedStatuses,
  from,
  to,
  sort,
  trainerOptionsError,
}: BookingsFiltersProps) {
  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  const [draftMember, setDraftMember] = useState(member)
  const [draftSession, setDraftSession] = useState(session)
  const [draftTrainer, setDraftTrainer] = useState(trainer)
  const [draftStatuses, setDraftStatuses] = useState<DerivedBookingStatus[]>(selectedStatuses)
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const [draftSort, setDraftSort] = useState<BookingSort>(sort)

  const hasInvalidDateRange = !isValidBookingDateRange(draftFrom, draftTo)

  const dateInputClassName = `min-w-0 rounded-[var(--radius-md)] border bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50 ${
    hasInvalidDateRange
      ? 'border-[var(--danger)] focus:border-[var(--danger)]'
      : 'border-[var(--border)] focus:border-[var(--primary)]'
  }`

  const trainerOptions = [
    { value: '', label: 'All trainers' },
    ...trainers.map(option => ({
      value: option.id,
      label: option.full_name,
    })),
  ]

  const activeFilterGroups = [
    member.trim().length > 0,
    session.trim().length > 0,
    trainer.length > 0,
    selectedStatuses.length > 0,
    from.length > 0,
    to.length > 0,
    sort !== 'upcoming',
  ].filter(Boolean).length

  function toggleStatus(status: DerivedBookingStatus) {
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

    const href = getBookingsHref({
      member: draftMember,
      session: draftSession,
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
    setDraftMember('')
    setDraftSession('')
    setDraftTrainer('')
    setDraftStatuses([])
    setDraftFrom('')
    setDraftTo('')
    setDraftSort('upcoming')

    startTransition(() => {
      router.push('/dashboard/bookings')
    })
  }

  return (
    <OperationsFilterPanel
      activeFilterCount={activeFilterGroups}
      onSubmit={event => {
        event.preventDefault()
        applyFilters()
      }}
    >
      <div className='grid min-w-0 gap-4 border-t border-[var(--border)] p-4 md:grid-cols-2 md:border-t-0 md:p-6 xl:grid-cols-3'>
        <label htmlFor='bookings-member' className='flex min-w-0 flex-col gap-2'>
          <span className='font-medium'>Member search</span>

          <input
            type='search'
            id='bookings-member'
            value={draftMember}
            disabled={isPending}
            onChange={event => setDraftMember(event.target.value)}
            placeholder='Name or email'
            className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </label>

        <label htmlFor='bookings-session' className='flex min-w-0 flex-col gap-2'>
          <span className='font-medium'>Session search</span>

          <input
            type='search'
            id='bookings-session'
            value={draftSession}
            disabled={isPending}
            onChange={event => setDraftSession(event.target.value)}
            placeholder='Session title'
            className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </label>

        <div className='relative z-30 min-w-0'>
          <SingleSelect
            label='Trainer'
            name='bookings-trainer-filter'
            options={trainerOptions}
            value={draftTrainer}
            disabled={isPending}
            onChange={setDraftTrainer}
          />
        </div>

        <div className='relative z-20 min-w-0'>
          <MultiSelectFilter
            label='Booking status'
            options={bookingStatusOptions}
            selectedValues={draftStatuses}
            disabled={isPending}
            onToggle={toggleStatus}
          />
        </div>

        <label htmlFor='bookings-from' className='flex min-w-0 flex-col gap-2'>
          <span className='font-medium'>From</span>

          <input
            type='date'
            id='bookings-from'
            value={draftFrom}
            disabled={isPending}
            onChange={event => setDraftFrom(event.target.value)}
            aria-invalid={hasInvalidDateRange}
            aria-describedby={hasInvalidDateRange ? 'bookings-date-range-error' : undefined}
            className={dateInputClassName}
          />
        </label>

        <label htmlFor='bookings-to' className='flex min-w-0 flex-col gap-2'>
          <span className='font-medium'>To</span>

          <input
            type='date'
            id='bookings-to'
            value={draftTo}
            disabled={isPending}
            onChange={event => setDraftTo(event.target.value)}
            aria-invalid={hasInvalidDateRange}
            aria-describedby={hasInvalidDateRange ? 'bookings-date-range-error' : undefined}
            className={dateInputClassName}
          />
        </label>
      </div>

      {hasInvalidDateRange && (
        <p
          id='bookings-date-range-error'
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

      <div className='flex min-w-0 flex-col gap-4 border-t border-[var(--border)] bg-[var(--surface-2)]/20 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6'>
        <div className='relative z-10 w-full min-w-0 md:max-w-xs'>
          <SingleSelect
            label='Sort'
            name='bookings-sort'
            options={bookingSortOptions}
            value={draftSort}
            disabled={isPending}
            onChange={setDraftSort}
          />
        </div>

        <div className='grid min-w-0 grid-cols-2 gap-2 md:flex md:shrink-0 md:justify-end'>
          <button
            type='submit'
            disabled={isPending || hasInvalidDateRange}
            className='min-w-0 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-32'
          >
            {isPending ? 'Applying…' : 'Apply filters'}
          </button>

          <button
            type='button'
            disabled={isPending}
            onClick={resetFilters}
            className='min-w-0 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-center font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 md:min-w-24'
          >
            Reset
          </button>
        </div>
      </div>
    </OperationsFilterPanel>
  )
}
