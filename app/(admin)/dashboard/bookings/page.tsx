import {
  isDerivedBookingStatus,
  sortBookingOperationRows,
  type BookingOperationRow,
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

  const { data, error } = await supabase
    .from('booking_operations')
    .select(
      'id, session_id, member_id, status, created_at, member_name, member_email, session_title, session_starts_at, session_ends_at, trainer_id, trainer_name, derived_status, is_cancellable',
    )

  const bookings: BookingOperationRow[] = data ?? []

  // Compute derived status counts from ALL bookings (before filtering)
  const statusCounts: Partial<Record<DerivedBookingStatus, number>> = {}
  for (const booking of bookings) {
    statusCounts[booking.derived_status] = (statusCounts[booking.derived_status] ?? 0) + 1
  }

  // Server-side filtering
  const filteredBookings = bookings.filter(booking => {
    if (selectedStatuses.length > 0) {
      if (!selectedStatuses.includes(booking.derived_status)) return false
    }

    if (memberFilter) {
      const query = memberFilter.toLowerCase()
      const name = booking.member_name.toLowerCase()
      const email = booking.member_email.toLowerCase()
      if (!name.includes(query) && !email.includes(query)) return false
    }

    if (sessionFilter) {
      const query = sessionFilter.toLowerCase()
      const title = booking.session_title.toLowerCase()
      if (!title.includes(query)) return false
    }

    return true
  })

  const sortedBookings = sortBookingOperationRows(filteredBookings)

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
