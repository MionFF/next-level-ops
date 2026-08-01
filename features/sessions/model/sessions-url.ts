import {
  derivedSessionStatuses,
  type DerivedSessionStatus,
  type SessionSort,
} from './session'

export type SessionsUrlState = {
  search: string
  trainer: string
  statuses: readonly DerivedSessionStatus[]
  from: string
  to: string
  sort: SessionSort
  page: number
}

export function getSessionsHref({
  search,
  trainer,
  statuses,
  from,
  to,
  sort,
  page,
}: SessionsUrlState) {
  const params = new URLSearchParams()
  const normalizedSearch = search.trim()

  if (normalizedSearch) {
    params.set('search', normalizedSearch)
  }

  if (trainer) {
    params.set('trainer', trainer)
  }

  for (const status of derivedSessionStatuses) {
    if (statuses.includes(status)) {
      params.append('statuses', status)
    }
  }

  if (from) {
    params.set('from', from)
  }

  if (to) {
    params.set('to', to)
  }

  if (sort !== 'soonest') {
    params.set('sort', sort)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()

  return query ? `/dashboard/sessions?${query}` : '/dashboard/sessions'
}
