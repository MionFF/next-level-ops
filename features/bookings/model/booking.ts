export const bookingStatuses = ['confirmed', 'cancelled'] as const

export type BookingStatus = (typeof bookingStatuses)[number]

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
