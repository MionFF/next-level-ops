'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  memberStatusOptions,
  membershipOperationalStatuses,
  membershipOperationalStatusLabels,
  type MemberStatus,
  type MembershipOperationalStatus,
  type ProfileLinkFilter,
} from '../model/member'
import { getMembersHref } from '../model/members-url'
import { MultiSelectFilter } from '@/shared/ui/filters/multi-select-filter'
import { OperationsFilterPanel } from '@/shared/ui/filters/operations-filter-panel'
import { SingleSelect } from '@/shared/ui/single-select'

type MembersFiltersProps = {
  search: string
  selectedStatuses: MemberStatus[]
  profile: ProfileLinkFilter
  selectedMemberships: MembershipOperationalStatus[]
}

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

  const [isPending, startTransition] = useTransition()

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
    <OperationsFilterPanel
      activeFilterCount={activeFilterGroups}
      onSubmit={event => {
        event.preventDefault()
        applyFilters()
      }}
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

        <SingleSelect
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
    </OperationsFilterPanel>
  )
}
