import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import type {
  BookingHistorySummary,
  CabinetUpcomingBooking,
} from '@/features/cabinet/model/cabinet-booking'
import { BookingHistorySummaryCard } from '@/features/cabinet/ui/booking-history-summary'
import { UnlinkedMemberState } from '@/features/cabinet/ui/unlinked-member-state'
import { UpcomingBookingsList } from '@/features/cabinet/ui/upcoming-bookings-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CabinetBookingsPage() {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'client') {
    redirect('/forbidden')
  }

  if (!profile.member_id) {
    return <UnlinkedMemberState title='Upcoming bookings' />
  }

  const supabase = await createClient()
  const now = new Date()
  const nowTime = now.getTime()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      created_at,
      session:sessions(
        id,
        title,
        starts_at,
        ends_at,
        trainer:trainers(id, full_name)
      )
    `,
    )
    .eq('member_id', profile.member_id)

  const normalizedBookings: CabinetUpcomingBooking[] =
    bookings?.map(booking => {
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
        session: session
          ? {
              ...session,
              trainer,
            }
          : null,
      }
    }) ?? []

  const upcomingBookings = normalizedBookings
    .filter(
      booking =>
        booking.status === 'confirmed' &&
        booking.session &&
        new Date(booking.session.starts_at).getTime() > nowTime,
    )
    .sort((a, b) => (a.session?.starts_at ?? '').localeCompare(b.session?.starts_at ?? ''))

  const summary: BookingHistorySummary = {
    total: normalizedBookings.length,
    upcoming: upcomingBookings.length,
    completed: normalizedBookings.filter(
      booking =>
        booking.status === 'confirmed' &&
        booking.session &&
        new Date(booking.session.ends_at).getTime() <= nowTime,
    ).length,
    cancelled: normalizedBookings.filter(booking => booking.status === 'cancelled').length,
  }

  return (
    <>
      <UpcomingBookingsList bookings={upcomingBookings} />
      <BookingHistorySummaryCard summary={summary} />
    </>
  )
}
