import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import type { CabinetUpcomingBooking } from '@/features/cabinet/model/cabinet-booking'
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

  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('member_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profileData?.member_id) {
    return <UnlinkedMemberState title='Upcoming bookings' />
  }

  const now = new Date()

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
    .eq('member_id', profileData.member_id)
    .eq('status', 'confirmed')

  const upcomingBookings: CabinetUpcomingBooking[] =
    bookings
      ?.map(booking => {
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
      })
      .filter(
        booking => booking.session && new Date(booking.session.starts_at).getTime() > now.getTime(),
      )
      .sort((a, b) => (a.session?.starts_at ?? '').localeCompare(b.session?.starts_at ?? '')) ?? []

  return <UpcomingBookingsList bookings={upcomingBookings} />
}
