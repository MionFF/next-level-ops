import {
  Booking,
  getDerivedBookingStatus,
  isDerivedBookingStatus,
  sortBookings,
  type DerivedBookingStatus,
} from '@/features/bookings/model/booking'
import BookingsFilters from '@/features/bookings/ui/bookings-filters'
import BookingsList from '@/features/bookings/ui/bookings-list'
import { createClient } from '@/lib/supabase/server'

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

type BookingsPageProps = {
  searchParams: Promise<{
    member?: string | string[]
    session?: string | string[]
    statuses?: string | string[]
  }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams

  const memberFilter = getParam(params.member)?.trim() ?? ''
  const sessionFilter = getParam(params.session)?.trim() ?? ''
  const statusesParam = getArrayParam(params.statuses)
  const selectedStatuses: DerivedBookingStatus[] = statusesParam.filter(isDerivedBookingStatus)

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

  // Compute derived status counts from ALL bookings (before filtering)
  const statusCounts: Partial<Record<DerivedBookingStatus, number>> = {}
  for (const b of normalizedBookings) {
    const derived = getDerivedBookingStatus(b)
    statusCounts[derived] = (statusCounts[derived] ?? 0) + 1
  }

  // Server-side filtering
  const filteredBookings = normalizedBookings.filter(booking => {
    if (selectedStatuses.length > 0) {
      const derived = getDerivedBookingStatus(booking)
      if (!selectedStatuses.includes(derived)) return false
    }

    if (memberFilter) {
      const query = memberFilter.toLowerCase()
      const name = booking.member?.full_name?.toLowerCase() ?? ''
      const email = booking.member?.email?.toLowerCase() ?? ''
      if (!name.includes(query) && !email.includes(query)) return false
    }

    if (sessionFilter) {
      const query = sessionFilter.toLowerCase()
      const title = booking.session?.title?.toLowerCase() ?? ''
      if (!title.includes(query)) return false
    }

    return true
  })

  const sortedBookings = sortBookings(filteredBookings)

  return (
    <>
      <BookingsFilters
        member={memberFilter}
        session={sessionFilter}
        selectedStatuses={selectedStatuses}
        statusCounts={statusCounts}
      />
      <BookingsList
        bookings={sortedBookings}
        errorMessage={error?.message}
        hasActiveFilters={
          memberFilter !== '' || sessionFilter !== '' || selectedStatuses.length > 0
        }
      />
    </>
  )
}
