import {
  derivedBookingStatuses,
  type BookingSort,
  type DerivedBookingStatus,
} from './booking'

export type BookingsUrlState = {
  member: string
  session: string
  trainer: string
  statuses: readonly DerivedBookingStatus[]
  from: string
  to: string
  sort: BookingSort
  page: number
}

export function getBookingsHref({
  member,
  session,
  trainer,
  statuses,
  from,
  to,
  sort,
  page,
}: BookingsUrlState) {
  const params = new URLSearchParams()
  const normalizedMember = member.trim()
  const normalizedSession = session.trim()

  if (normalizedMember) {
    params.set('member', normalizedMember)
  }

  if (normalizedSession) {
    params.set('session', normalizedSession)
  }

  if (trainer) {
    params.set('trainer', trainer)
  }

  for (const status of derivedBookingStatuses) {
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

  return query ? `/dashboard/bookings?${query}` : '/dashboard/bookings'
}
