import {
  memberStatuses,
  membershipOperationalStatuses,
  type MemberStatus,
  type MembershipOperationalStatus,
  type ProfileLinkFilter,
} from './member'

type MembersUrlState = {
  search: string
  statuses: readonly MemberStatus[]
  profile: ProfileLinkFilter
  memberships: readonly MembershipOperationalStatus[]
  page: number
}

export function getMembersHref({ search, statuses, profile, memberships, page }: MembersUrlState) {
  const params = new URLSearchParams()

  if (search) {
    params.set('search', search)
  }

  for (const status of memberStatuses) {
    if (statuses.includes(status)) {
      params.append('status', status)
    }
  }

  if (profile !== 'all') {
    params.set('profile', profile)
  }

  for (const membership of membershipOperationalStatuses) {
    if (memberships.includes(membership)) {
      params.append('membership', membership)
    }
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()

  return query ? `/dashboard/members?${query}` : '/dashboard/members'
}
