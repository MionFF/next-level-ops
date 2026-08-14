import {
  derivedBookingStatuses,
  isBookingSort,
  isDerivedBookingStatus,
  type BookingListRow,
  type BookingSort,
} from '@/features/bookings/model/booking'
import {
  getBookingDateBoundaries,
  getBookingsMemberSearchFilter,
  getBookingsSessionSearchFilter,
  isValidBookingDate,
  isValidBookingDateRange,
} from '@/features/bookings/model/bookings-query'
import { getBookingsHref } from '@/features/bookings/model/bookings-url'
import BookingsFilters from '@/features/bookings/ui/bookings-filters'
import BookingsList from '@/features/bookings/ui/bookings-list'
import BookingsPagination from '@/features/bookings/ui/bookings-pagination'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PAGE_SIZE = 10

type BookingsPageProps = {
  searchParams: Promise<{
    member?: string | string[]
    session?: string | string[]
    trainer?: string | string[]
    statuses?: string | string[]
    from?: string | string[]
    to?: string | string[]
    sort?: string | string[]
    page?: string | string[]
  }>
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getParams(value: string | string[] | undefined) {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function getPage(value: string | undefined) {
  if (!value) {
    return 1
  }

  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return page
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams

  const member = getParam(params.member)?.trim() ?? ''
  const session = getParam(params.session)?.trim() ?? ''
  const trainer = getParam(params.trainer)?.trim() ?? ''
  const validStatuses = new Set(getParams(params.statuses).filter(isDerivedBookingStatus))
  const selectedStatuses = derivedBookingStatuses.filter(status => validStatuses.has(status))

  const rawFrom = getParam(params.from)
  const from = isValidBookingDate(rawFrom) ? rawFrom : ''

  const rawTo = getParam(params.to)
  const to = isValidBookingDate(rawTo) ? rawTo : ''

  const hasInvalidDateRange = !isValidBookingDateRange(from, to)

  const rawSort = getParam(params.sort)
  const sort: BookingSort = isBookingSort(rawSort) ? rawSort : 'upcoming'
  const page = getPage(getParam(params.page))

  const memberSearchFilter = member ? getBookingsMemberSearchFilter(member) : null
  const sessionSearchFilter = session ? getBookingsSessionSearchFilter(session) : null
  const { fromInclusive, toExclusive } = getBookingDateBoundaries(from, to)

  const filtersKey = [member, session, trainer, selectedStatuses.join(','), from, to, sort].join(
    '|',
  )

  const supabase = await createClient()

  const trainersQuery = supabase
    .from('trainers')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  if (hasInvalidDateRange) {
    const { data: trainers, error: trainersError } = await trainersQuery

    return (
      <>
        <BookingsFilters
          key={filtersKey}
          member={member}
          session={session}
          trainer={trainer}
          trainers={trainers ?? []}
          selectedStatuses={selectedStatuses}
          from={from}
          to={to}
          sort={sort}
          trainerOptionsError={trainersError?.message}
        />

        <BookingsList bookings={[]} emptyMessage='Fix the date range to view bookings.' />
      </>
    )
  }

  let countQuery = supabase.from('booking_operations').select('id', {
    count: 'exact',
    head: true,
  })

  let bookingsQuery = supabase.from('booking_operations').select(`
    id,
    member_name,
    member_email,
    session_title,
    session_starts_at,
    trainer_name,
    created_at,
    derived_status,
    is_cancellable
  `)

  if (memberSearchFilter) {
    countQuery = countQuery.or(memberSearchFilter)
    bookingsQuery = bookingsQuery.or(memberSearchFilter)
  }

  if (sessionSearchFilter) {
    countQuery = countQuery.or(sessionSearchFilter)
    bookingsQuery = bookingsQuery.or(sessionSearchFilter)
  }

  if (trainer) {
    countQuery = countQuery.eq('trainer_id', trainer)
    bookingsQuery = bookingsQuery.eq('trainer_id', trainer)
  }

  if (selectedStatuses.length > 0) {
    countQuery = countQuery.in('derived_status', selectedStatuses)
    bookingsQuery = bookingsQuery.in('derived_status', selectedStatuses)
  }

  if (fromInclusive) {
    countQuery = countQuery.gte('session_starts_at', fromInclusive)
    bookingsQuery = bookingsQuery.gte('session_starts_at', fromInclusive)
  }

  if (toExclusive) {
    countQuery = countQuery.lt('session_starts_at', toExclusive)
    bookingsQuery = bookingsQuery.lt('session_starts_at', toExclusive)
  }

  const [{ data: trainers, error: trainersError }, { count, error: countError }] =
    await Promise.all([trainersQuery, countQuery])

  const filterProps = {
    member,
    session,
    trainer,
    trainers: trainers ?? [],
    selectedStatuses,
    from,
    to,
    sort,
    trainerOptionsError: trainersError?.message,
  }

  if (countError) {
    return (
      <>
        <BookingsFilters key={filtersKey} {...filterProps} />

        <BookingsList bookings={[]} errorMessage={countError.message} />
      </>
    )
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (page > totalPages) {
    redirect(
      getBookingsHref({
        member,
        session,
        trainer,
        statuses: selectedStatuses,
        from,
        to,
        sort,
        page: totalPages,
      }),
    )
  }

  const fromIndex = (page - 1) * PAGE_SIZE
  const toIndex = fromIndex + PAGE_SIZE - 1

  if (sort === 'upcoming') {
    bookingsQuery = bookingsQuery
      .order('operational_sort_group', { ascending: true })
      .order('operational_sort_key', { ascending: true })
      .order('id', { ascending: true })
  } else {
    const ascending = sort === 'soonest'

    bookingsQuery = bookingsQuery
      .order('session_starts_at', { ascending })
      .order('id', { ascending })
  }

  bookingsQuery = bookingsQuery.range(fromIndex, toIndex)

  const { data, error } = await bookingsQuery
  const bookings: BookingListRow[] = data ?? []
  const hasFilters = Boolean(
    member || session || trainer || selectedStatuses.length > 0 || from || to,
  )

  return (
    <>
      <BookingsFilters key={filtersKey} {...filterProps} />

      <BookingsList
        bookings={bookings}
        errorMessage={error?.message}
        emptyMessage={hasFilters ? 'No bookings match your filters.' : undefined}
      />

      {!error && totalCount > 0 && (
        <BookingsPagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          member={member}
          session={session}
          trainer={trainer}
          statuses={selectedStatuses}
          from={from}
          to={to}
          sort={sort}
        />
      )}
    </>
  )
}
