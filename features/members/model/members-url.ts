import type { MemberStatusFilter } from './member'

type MembersUrlState = {
  search: string
  status: MemberStatusFilter
  page: number
}

export function getMembersHref({ search, status, page }: MembersUrlState) {
  const params = new URLSearchParams()

  if (search) {
    params.set('search', search)
  }

  if (status !== 'all') {
    params.set('status', status)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()

  return query ? `/dashboard/members?${query}` : '/dashboard/members'
}
