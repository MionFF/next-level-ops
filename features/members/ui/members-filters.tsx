'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import {
  memberStatuses,
  memberStatusLabels,
  membershipOperationalStatuses,
  membershipOperationalStatusLabels,
  type MemberStatus,
  type MembershipOperationalStatus,
  type ProfileLinkFilter,
} from '../model/member'
import { getMembersHref } from '../model/members-url'
import { MultiSelectFilter } from '@/shared/ui/filters/multi-select-filter'
import { SingleSelectFilter } from '@/shared/ui/filters/single-select-filter'

type MembersFiltersProps = {
  search: string
  selectedStatuses: MemberStatus[]
  profile: ProfileLinkFilter
  selectedMemberships: MembershipOperationalStatus[]
}

const memberStatusOptions = memberStatuses.map(status => ({
  value: status,
  label: memberStatusLabels[status],
}))

const membershipOptions = membershipOperationalStatuses.map(status => ({
  value: status,
  label: membershipOperationalStatusLabels[status],
}))

const profileOptions = [
  { value: 'all', label: 'All profiles' },
  { value: 'linked', label: 'Linked' },
  { value: 'unlinked', label: 'Unlinked' },
] as const

export default function MembersFilters({
  search,
  selectedStatuses,
  profile,
  selectedMemberships,
}: MembersFiltersProps) {
  const router = useRouter()
  const panelId = useId()

  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const [draftSearch, setDraftSearch] = useState(search)
  const [draftStatuses, setDraftStatuses] = useState<MemberStatus[]>(selectedStatuses)
  const [draftProfile, setDraftProfile] = useState<ProfileLinkFilter>(profile)
  const [draftMemberships, setDraftMemberships] =
    useState<MembershipOperationalStatus[]>(selectedMemberships)

  const activeFilterGroups = [
    search.trim().length > 0,
    selectedStatuses.length > 0,
    profile !== 'all',
    selectedMemberships.length > 0,
  ].filter(Boolean).length

  function toggleStatus(status: MemberStatus) {
    setDraftStatuses(current =>
      current.includes(status)
        ? current.filter(currentStatus => currentStatus !== status)
        : [...current, status],
    )
  }

  function toggleMembership(membership: MembershipOperationalStatus) {
    setDraftMemberships(current =>
      current.includes(membership)
        ? current.filter(currentMembership => currentMembership !== membership)
        : [...current, membership],
    )
  }

  function applyFilters() {
    const href = getMembersHref({
      search: draftSearch.trim(),
      statuses: draftStatuses,
      profile: draftProfile,
      memberships: draftMemberships,
      page: 1,
    })

    startTransition(() => {
      router.push(href)
    })
  }

  function resetFilters() {
    setDraftSearch('')
    setDraftStatuses([])
    setDraftProfile('all')
    setDraftMemberships([])

    startTransition(() => {
      router.push('/dashboard/members')
    })
  }

  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        applyFilters()
      }}
      className='mb-8 min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]'
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
          <div className='grid min-w-0 gap-4 border-t border-[var(--border)] p-4 md:grid-cols-2 md:border-t-0 md:p-6 2xl:grid-cols-[minmax(16rem,2fr)_repeat(3,minmax(9rem,1fr))_auto] 2xl:items-end'>
            <label htmlFor='members-search' className='flex min-w-0 flex-col gap-2'>
              <span className='font-medium'>Search</span>

              <input
                type='search'
                id='members-search'
                value={draftSearch}
                disabled={isPending}
                onChange={event => setDraftSearch(event.target.value)}
                placeholder='Search by name, email or phone'
                className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
              />
            </label>

            <MultiSelectFilter
              label='Member status'
              options={memberStatusOptions}
              selectedValues={draftStatuses}
              disabled={isPending}
              onToggle={toggleStatus}
            />

            <SingleSelectFilter
              label='Profile'
              name='profile-filter'
              options={profileOptions}
              value={draftProfile}
              disabled={isPending}
              onChange={setDraftProfile}
            />

            <MultiSelectFilter
              label='Membership'
              options={membershipOptions}
              selectedValues={draftMemberships}
              disabled={isPending}
              onToggle={toggleMembership}
            />

            <div className='grid min-w-0 grid-cols-2 gap-2 md:col-span-2 2xl:col-span-1 2xl:flex'>
              <button
                type='submit'
                disabled={isPending}
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
        </div>
      </div>
    </form>
  )
}
