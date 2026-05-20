export const bookingStatuses = ['confirmed', 'cancelled'] as const

export type BookingStatus = (typeof bookingStatuses)[number]

export const derivedBookingStatuses = [
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
] as const

export type DerivedBookingStatus = (typeof derivedBookingStatuses)[number]

export type Booking = {
  id: string
  session_id: string
  member_id: string
  status: BookingStatus
  created_at: string
  member: { id: string; full_name: string; email: string } | null
  session: {
    id: string
    title: string
    starts_at: string
    ends_at: string
    trainer: { id: string; full_name: string } | null
  } | null
}

export function isBookingStatus(value: string | undefined): value is BookingStatus {
  return value === 'confirmed' || value === 'cancelled'
}

export function isDerivedBookingStatus(value: string | undefined): value is DerivedBookingStatus {
  return (derivedBookingStatuses as readonly string[]).includes(value ?? '')
}

export function getDerivedBookingStatus(booking: Booking): DerivedBookingStatus {
  const now = new Date()

  if (booking.status === 'cancelled') {
    return 'cancelled'
  }

  if (booking.session?.ends_at && new Date(booking.session.ends_at) <= now) {
    return 'completed'
  }

  if (
    booking.session?.starts_at &&
    booking.session?.ends_at &&
    new Date(booking.session.starts_at) <= now &&
    new Date(booking.session.ends_at) > now
  ) {
    return 'in_progress'
  }

  return 'confirmed'
}

/** Sort priority: confirmed < in_progress < completed < cancelled */
const derivedStatusSortOrder: Record<DerivedBookingStatus, number> = {
  confirmed: 0,
  in_progress: 1,
  completed: 2,
  cancelled: 3,
}

export function getBookingDisplayBadge(status: DerivedBookingStatus): {
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
    case 'confirmed':
      return {
        text: 'Confirmed',
        className: 'border-[var(--border)] text-[var(--foreground)]',
      }
  }
}

export function sortBookings(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    const statusA = getDerivedBookingStatus(a)
    const statusB = getDerivedBookingStatus(b)

    const orderDiff = derivedStatusSortOrder[statusA] - derivedStatusSortOrder[statusB]
    if (orderDiff !== 0) return orderDiff

    const startsAtA = a.session?.starts_at ? new Date(a.session.starts_at).getTime() : 0
    const startsAtB = b.session?.starts_at ? new Date(b.session.starts_at).getTime() : 0

    // Future/current: ascending; completed/cancelled: descending
    if (statusA === 'confirmed' || statusA === 'in_progress') {
      return startsAtA - startsAtB
    }

    return startsAtB - startsAtA
  })
}
