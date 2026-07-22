import {
  isDerivedSessionStatus,
  type DerivedSessionStatus,
  type SessionOperationRow,
  sortSessionOperationRows,
} from '@/features/sessions/model/session'
import SessionsFilters from '@/features/sessions/ui/sessions-filters'
import SessionsList from '@/features/sessions/ui/sessions-list'
import { createClient } from '@/lib/supabase/server'

type SessionsPageProps = {
  searchParams: Promise<{
    trainer?: string
    statuses?: string | string[]
  }>
}

type TrainerFilterOption = {
  id: string
  full_name: string
}

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const params = await searchParams

  // Parse URL filters
  const filterTrainerId = params.trainer ?? ''
  const rawStatuses = Array.isArray(params.statuses)
    ? params.statuses
    : params.statuses
      ? [params.statuses]
      : []
  const filterStatuses: DerivedSessionStatus[] = rawStatuses.filter(isDerivedSessionStatus)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_operations')
    .select(
      'id, title, trainer_id, trainer_name, starts_at, ends_at, capacity, status, created_at, confirmed_bookings_count, derived_status, available_spots',
    )

  const sessions: SessionOperationRow[] = data ?? []

  const trainers: TrainerFilterOption[] = []
  const seenTrainerIds = new Set<string>()

  for (const session of sessions) {
    if (seenTrainerIds.has(session.trainer_id)) continue

    seenTrainerIds.add(session.trainer_id)
    trainers.push({ id: session.trainer_id, full_name: session.trainer_name })
  }

  trainers.sort((a, b) => a.full_name.localeCompare(b.full_name))

  // Apply trainer filter first
  const trainerFiltered = filterTrainerId
    ? sessions.filter(session => session.trainer_id === filterTrainerId)
    : sessions

  // Calculate status counts from trainer-filtered sessions (stable, not affected by selected statuses)
  const statusCounts: Partial<Record<DerivedSessionStatus, number>> = {}
  for (const session of trainerFiltered) {
    statusCounts[session.derived_status] = (statusCounts[session.derived_status] ?? 0) + 1
  }

  // Apply status filter on top of trainer filter
  const filtered =
    filterStatuses.length > 0
      ? trainerFiltered.filter(session => filterStatuses.includes(session.derived_status))
      : trainerFiltered

  const sortedSessions = sortSessionOperationRows(filtered)

  const hasFilters = Boolean(filterTrainerId || filterStatuses.length > 0)

  return (
    <>
      <SessionsFilters
        trainer={filterTrainerId}
        trainers={trainers}
        selectedStatuses={filterStatuses}
        statusCounts={statusCounts}
      />
      <SessionsList
        sessions={sortedSessions}
        errorMessage={error?.message}
        emptyMessage={hasFilters ? 'No sessions match your filters.' : undefined}
      />
    </>
  )
}
