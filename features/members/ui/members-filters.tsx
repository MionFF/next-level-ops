'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
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
import MembersMultiSelectFilter from './members-multi-select-filter'
import MembersSingleSelectFilter from './members-single-select-filter'

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
  const [isPending, startTransition] = useTransition()

  const [draftSearch, setDraftSearch] = useState(search)
  const [draftStatuses, setDraftStatuses] = useState<MemberStatus[]>(selectedStatuses)
  const [draftProfile, setDraftProfile] = useState<ProfileLinkFilter>(profile)
  const [draftMemberships, setDraftMemberships] =
    useState<MembershipOperationalStatus[]>(selectedMemberships)

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
      className='mb-8 grid gap-4 text-sm text-[var(--foreground)] md:grid-cols-2 md:rounded-[var(--radius-md)] md:border md:border-[var(--border)] md:bg-[var(--surface)] md:p-6 xl:grid-cols-[minmax(18rem,2fr)_repeat(3,minmax(10rem,1fr))_auto] xl:items-end'
    >
      <label htmlFor='members-search' className='flex min-w-0 flex-col gap-2'>
        <span className='font-medium'>Search</span>

        <input
          type='search'
          id='members-search'
          value={draftSearch}
          disabled={isPending}
          onChange={event => setDraftSearch(event.target.value)}
          placeholder='Search by name, email or phone'
          className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
        />
      </label>

      <MembersMultiSelectFilter
        label='Member status'
        options={memberStatusOptions}
        selectedValues={draftStatuses}
        disabled={isPending}
        onToggle={toggleStatus}
      />

      <MembersSingleSelectFilter
        label='Profile'
        name='profile-filter'
        options={profileOptions}
        value={draftProfile}
        disabled={isPending}
        onChange={setDraftProfile}
      />

      <MembersMultiSelectFilter
        label='Membership'
        options={membershipOptions}
        selectedValues={draftMemberships}
        disabled={isPending}
        onToggle={toggleMembership}
      />

      <div className='flex gap-2 md:col-span-2 xl:col-span-1'>
        <button
          type='submit'
          disabled={isPending}
          className='flex-1 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none'
        >
          {isPending ? 'Applying…' : 'Apply filters'}
        </button>

        <button
          type='button'
          disabled={isPending}
          onClick={resetFilters}
          className='flex-1 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-center font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none'
        >
          Reset
        </button>
      </div>
    </form>
  )
}
