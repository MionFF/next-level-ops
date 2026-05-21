export const sessionStatuses = ['scheduled', 'cancelled'] as const

export type SessionStatus = (typeof sessionStatuses)[number]

export const derivedSessionStatuses = [
  'scheduled',
  'in_progress',
  'full',
  'completed',
  'cancelled',
] as const

export type DerivedSessionStatus = (typeof derivedSessionStatuses)[number]

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

export function getDerivedSessionStatus(session: Session): DerivedSessionStatus {
  const now = new Date()

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

export function getSessionDisplayBadge(status: DerivedSessionStatus): {
  text: string
  className: string
} {
  switch (status) {
    case 'cancelled':
      return {
        text: 'Cancelled',
        className: 'border-[var(--border)] text-[var(--muted)]',
      }
    case 'completed':
      return {
        text: 'Completed',
        className: 'border-[var(--border)] text-[var(--muted)]',
      }
    case 'in_progress':
      return {
        text: 'In progress',
        className: 'border-[var(--primary)]/30 text-[var(--primary)]',
      }
    case 'full':
      return {
        text: 'Full',
        className: 'border-[var(--danger)]/30 text-[var(--danger)]',
      }
    case 'scheduled':
      return {
        text: 'Scheduled',
        className: 'border-[var(--border)] text-[var(--foreground)]',
      }
  }
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
