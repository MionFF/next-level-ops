export const sessionStatuses = ['scheduled', 'cancelled'] as const

export type SessionStatus = (typeof sessionStatuses)[number]

export const sessionStatusLabels: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
}

export const sessionStatusOptions = sessionStatuses.map(status => ({
  value: status,
  label: sessionStatusLabels[status],
}))

export const derivedSessionStatuses = [
  'scheduled',
  'in_progress',
  'full',
  'completed',
  'cancelled',
] as const

export type DerivedSessionStatus = (typeof derivedSessionStatuses)[number]

export const derivedSessionStatusLabels: Record<DerivedSessionStatus, string> = {
  scheduled: sessionStatusLabels.scheduled,
  in_progress: 'In progress',
  full: 'Full',
  completed: 'Completed',
  cancelled: sessionStatusLabels.cancelled,
}

export type Session = {
  id: string
  title: string
  trainer_id: string
  trainer: { id: string; full_name: string } | null
  starts_at: string
  ends_at: string
  capacity: number
  status: SessionStatus
  created_at: string
  confirmed_bookings_count: number
}

export type SessionOperationRow = {
  id: string
  title: string
  trainer_id: string
  trainer_name: string
  starts_at: string
  ends_at: string
  capacity: number
  status: SessionStatus
  created_at: string
  confirmed_bookings_count: number
  derived_status: DerivedSessionStatus
  available_spots: number
}

export type SessionListRow = Pick<
  SessionOperationRow,
  | 'id'
  | 'title'
  | 'trainer_name'
  | 'starts_at'
  | 'ends_at'
  | 'capacity'
  | 'created_at'
  | 'confirmed_bookings_count'
  | 'derived_status'
>

export const sessionSortOptions = ['upcoming', 'soonest', 'latest'] as const

export type SessionSort = (typeof sessionSortOptions)[number]

export type EditableSession = Pick<
  Session,
  'id' | 'title' | 'trainer_id' | 'starts_at' | 'ends_at' | 'capacity' | 'status'
>

export function isSessionStatus(value: string | undefined): value is SessionStatus {
  return value === 'scheduled' || value === 'cancelled'
}

export function isDerivedSessionStatus(value: string | undefined): value is DerivedSessionStatus {
  return (
    value === 'scheduled' ||
    value === 'in_progress' ||
    value === 'full' ||
    value === 'completed' ||
    value === 'cancelled'
  )
}

export function isSessionSort(value: string | undefined): value is SessionSort {
  return value === 'upcoming' || value === 'soonest' || value === 'latest'
}

export function getDerivedSessionStatus(session: Session, now = new Date()): DerivedSessionStatus {
  if (session.status === 'cancelled') {
    return 'cancelled'
  }

  if (new Date(session.ends_at) <= now) {
    return 'completed'
  }

  if (new Date(session.starts_at) <= now && new Date(session.ends_at) > now) {
    return 'in_progress'
  }

  if (session.confirmed_bookings_count >= session.capacity) {
    return 'full'
  }

  return 'scheduled'
}

/** Sort priority: in_progress < scheduled < full < completed < cancelled */
const derivedStatusSortOrder: Record<DerivedSessionStatus, number> = {
  in_progress: 0,
  scheduled: 1,
  full: 2,
  completed: 3,
  cancelled: 4,
}

export function sortSessions(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const statusA = getDerivedSessionStatus(a)
    const statusB = getDerivedSessionStatus(b)

    const orderDiff = derivedStatusSortOrder[statusA] - derivedStatusSortOrder[statusB]
    if (orderDiff !== 0) return orderDiff

    const startsAtA = new Date(a.starts_at).getTime()
    const startsAtB = new Date(b.starts_at).getTime()

    // Active/future: ascending; completed/cancelled: descending
    if (statusA === 'in_progress' || statusA === 'scheduled' || statusA === 'full') {
      return startsAtA - startsAtB
    }

    return startsAtB - startsAtA
  })
}

export function sortSessionOperationRows(rows: SessionOperationRow[]): SessionOperationRow[] {
  return [...rows].sort((a, b) => {
    const orderDiff =
      derivedStatusSortOrder[a.derived_status] - derivedStatusSortOrder[b.derived_status]
    if (orderDiff !== 0) return orderDiff

    const startsAtA = new Date(a.starts_at).getTime()
    const startsAtB = new Date(b.starts_at).getTime()

    if (
      a.derived_status === 'in_progress' ||
      a.derived_status === 'scheduled' ||
      a.derived_status === 'full'
    ) {
      return startsAtA - startsAtB
    }

    return startsAtB - startsAtA
  })
}
