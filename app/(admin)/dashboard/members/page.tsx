import {
  isMemberStatus,
  isMembershipOperationalStatus,
  isProfileLinkStatus,
} from '@/features/members/model/member'
import { getMembersSearchFilter } from '@/features/members/model/members-query'
import { getMembersHref } from '@/features/members/model/members-url'
import MembersFilters from '@/features/members/ui/members-filters'
import MembersList from '@/features/members/ui/members-list'
import MembersPagination from '@/features/members/ui/members-pagination'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PAGE_SIZE = 10

type MembersPageProps = {
  searchParams: Promise<{
    search?: string | string[]
    status?: string | string[]
    profile?: string | string[]
    membership?: string | string[]
    page?: string | string[]
  }>
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getParams(value: string | string[] | undefined) {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function getPage(value: string | undefined) {
  if (!value) {
    return 1
  }

  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return page
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams

  const search = getParam(params.search)?.trim() ?? ''

  const selectedStatuses = Array.from(new Set(getParams(params.status).filter(isMemberStatus)))

  const profileParam = getParam(params.profile)
  const profile = isProfileLinkStatus(profileParam) ? profileParam : 'all'

  const selectedMemberships = Array.from(
    new Set(getParams(params.membership).filter(isMembershipOperationalStatus)),
  )

  const page = getPage(getParam(params.page))
  const searchFilter = search ? getMembersSearchFilter(search) : null

  const filtersKey = [
    search,
    selectedStatuses.join(','),
    profile,
    selectedMemberships.join(','),
  ].join('|')

  const supabase = await createClient()

  let countQuery = supabase.from('member_operations').select('id', {
    count: 'exact',
    head: true,
  })

  if (searchFilter) {
    countQuery = countQuery.or(searchFilter)
  }

  if (selectedStatuses.length > 0) {
    countQuery = countQuery.in('status', selectedStatuses)
  }

  if (profile !== 'all') {
    countQuery = countQuery.eq('is_profile_linked', profile === 'linked')
  }

  if (selectedMemberships.length > 0) {
    countQuery = countQuery.in('membership_status', selectedMemberships)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    return (
      <>
        <MembersFilters
          key={filtersKey}
          search={search}
          selectedStatuses={selectedStatuses}
          profile={profile}
          selectedMemberships={selectedMemberships}
        />

        <MembersList members={[]} errorMessage={countError.message} />
      </>
    )
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (page > totalPages) {
    redirect(
      getMembersHref({
        search,
        statuses: selectedStatuses,
        profile,
        memberships: selectedMemberships,
        page: totalPages,
      }),
    )
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let membersQuery = supabase
    .from('member_operations')
    .select(
      `
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        is_profile_linked,
        membership_status,
        membership_plan_name,
        membership_starts_at,
        membership_ends_at
      `,
    )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to)

  if (searchFilter) {
    membersQuery = membersQuery.or(searchFilter)
  }

  if (selectedStatuses.length > 0) {
    membersQuery = membersQuery.in('status', selectedStatuses)
  }

  if (profile !== 'all') {
    membersQuery = membersQuery.eq('is_profile_linked', profile === 'linked')
  }

  if (selectedMemberships.length > 0) {
    membersQuery = membersQuery.in('membership_status', selectedMemberships)
  }

  const { data, error } = await membersQuery

  const members = data ?? []

  return (
    <>
      <MembersFilters
        key={filtersKey}
        search={search}
        selectedStatuses={selectedStatuses}
        profile={profile}
        selectedMemberships={selectedMemberships}
      />

      <MembersList members={members} errorMessage={error?.message} />

      {!error && totalCount > 0 && (
        <MembersPagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          search={search}
          statuses={selectedStatuses}
          profile={profile}
          memberships={selectedMemberships}
        />
      )}
    </>
  )
}
