import { Booking } from '@/features/bookings/model/booking'
import BookingsList from '@/features/bookings/ui/bookings-list'
import { createClient } from '@/lib/supabase/server'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      'id, session_id, member_id, status, created_at, member:members(id, full_name, email), session:sessions(id, title, starts_at, ends_at, trainer:trainers(id, full_name))',
    )
    .order('created_at', { ascending: false })

  const normalizedBookings: Booking[] =
    bookings?.map(booking => {
      const member = Array.isArray(booking.member) ? (booking.member[0] ?? null) : booking.member

      const session = Array.isArray(booking.session)
        ? (booking.session[0] ?? null)
        : booking.session

      const trainer = session
        ? Array.isArray(session.trainer)
          ? (session.trainer[0] ?? null)
          : session.trainer
        : null

      return {
        ...booking,
        member,
        session: session
          ? {
              ...session,
              trainer,
            }
          : null,
      }
    }) ?? []

  return <BookingsList bookings={normalizedBookings} errorMessage={error?.message} />
}
