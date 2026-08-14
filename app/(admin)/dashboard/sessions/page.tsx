import {
  derivedSessionStatuses,
  isDerivedSessionStatus,
  isSessionSort,
  type SessionSort,
} from '@/features/sessions/model/session'
import {
  getSessionDateBoundaries,
  getSessionsSearchFilter,
  isValidSessionDate,
  isValidSessionDateRange,
} from '@/features/sessions/model/sessions-query'
import { getSessionsHref } from '@/features/sessions/model/sessions-url'
import SessionsFilters from '@/features/sessions/ui/sessions-filters'
import SessionsList from '@/features/sessions/ui/sessions-list'
import SessionsPagination from '@/features/sessions/ui/sessions-pagination'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PAGE_SIZE = 10

type SessionsPageProps = {
  searchParams: Promise<{
    search?: string | string[]
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

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const params = await searchParams

  const search = getParam(params.search)?.trim() ?? ''
  const trainer = getParam(params.trainer)?.trim() ?? ''
  const validStatuses = new Set(getParams(params.statuses).filter(isDerivedSessionStatus))
  const selectedStatuses = derivedSessionStatuses.filter(status => validStatuses.has(status))

  const rawFrom = getParam(params.from)
  const from = isValidSessionDate(rawFrom) ? rawFrom : ''

  const rawTo = getParam(params.to)
  const to = isValidSessionDate(rawTo) ? rawTo : ''

  const hasInvalidDateRange = !isValidSessionDateRange(from, to)

  const rawSort = getParam(params.sort)
  const sort: SessionSort = isSessionSort(rawSort) ? rawSort : 'upcoming'
  const page = getPage(getParam(params.page))

  const searchFilter = search ? getSessionsSearchFilter(search) : null
  const { fromInclusive, toExclusive } = getSessionDateBoundaries(from, to)

  const filtersKey = [search, trainer, selectedStatuses.join(','), from, to, sort].join('|')

  const supabase = await createClient()

  const trainersQuery = supabase
    .from('trainers')
    .select('id, full_name')
    .eq('status', 'active')
    .order('full_name', { ascending: true })

  if (hasInvalidDateRange) {
    const { data: trainers, error: trainersError } = await trainersQuery

    return (
      <>
        <SessionsFilters
          key={filtersKey}
          search={search}
          trainer={trainer}
          trainers={trainers ?? []}
          selectedStatuses={selectedStatuses}
          from={from}
          to={to}
          sort={sort}
          trainerOptionsError={trainersError?.message}
        />

        <SessionsList sessions={[]} emptyMessage='Fix the date range to view sessions.' />
      </>
    )
  }

  let countQuery = supabase.from('session_operations').select('id', {
    count: 'exact',
    head: true,
  })

  let sessionsQuery = supabase.from('session_operations').select(`
    id,
    title,
    trainer_name,
    starts_at,
    ends_at,
    capacity,
    created_at,
    confirmed_bookings_count,
    derived_status
  `)

  if (searchFilter) {
    countQuery = countQuery.or(searchFilter)
    sessionsQuery = sessionsQuery.or(searchFilter)
  }

  if (trainer) {
    countQuery = countQuery.eq('trainer_id', trainer)
    sessionsQuery = sessionsQuery.eq('trainer_id', trainer)
  }

  if (selectedStatuses.length > 0) {
    countQuery = countQuery.in('derived_status', selectedStatuses)
    sessionsQuery = sessionsQuery.in('derived_status', selectedStatuses)
  }

  if (fromInclusive) {
    countQuery = countQuery.gte('starts_at', fromInclusive)
    sessionsQuery = sessionsQuery.gte('starts_at', fromInclusive)
  }

  if (toExclusive) {
    countQuery = countQuery.lt('starts_at', toExclusive)
    sessionsQuery = sessionsQuery.lt('starts_at', toExclusive)
  }

  const [{ data: trainers, error: trainersError }, { count, error: countError }] =
    await Promise.all([trainersQuery, countQuery])

  const filterProps = {
    search,
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
        <SessionsFilters key={filtersKey} {...filterProps} />

        <SessionsList sessions={[]} errorMessage={countError.message} />
      </>
    )
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (page > totalPages) {
    redirect(
      getSessionsHref({
        search,
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
    sessionsQuery = sessionsQuery
      .order('operational_sort_group', { ascending: true })
      .order('operational_sort_key', { ascending: true })
      .order('id', { ascending: true })
  } else {
    const ascending = sort === 'soonest'

    sessionsQuery = sessionsQuery.order('starts_at', { ascending }).order('id', { ascending })
  }

  sessionsQuery = sessionsQuery.range(fromIndex, toIndex)

  const { data, error } = await sessionsQuery
  const hasFilters = Boolean(search || trainer || selectedStatuses.length > 0 || from || to)

  return (
    <>
      <SessionsFilters key={filtersKey} {...filterProps} />

      <SessionsList
        sessions={data ?? []}
        errorMessage={error?.message}
        emptyMessage={hasFilters ? 'No sessions match your filters.' : undefined}
      />

      {!error && totalCount > 0 && (
        <SessionsPagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          search={search}
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
