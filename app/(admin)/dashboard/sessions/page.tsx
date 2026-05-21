import {
  Session,
  getDerivedSessionStatus,
  isDerivedSessionStatus,
  sortSessions,
  type DerivedSessionStatus,
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

  // Load sessions
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(
      'id, title, trainer_id, starts_at, ends_at, capacity, status, created_at, trainer:trainers(id, full_name)',
    )
    .order('starts_at', { ascending: true })

  // Load confirmed bookings for capacity display
  const { data: confirmedBookings } = await supabase
    .from('bookings')
    .select('session_id')
    .eq('status', 'confirmed')

  const confirmedCounts = new Map<string, number>()
  for (const booking of confirmedBookings ?? []) {
    confirmedCounts.set(booking.session_id, (confirmedCounts.get(booking.session_id) ?? 0) + 1)
  }

  // Normalize
  const normalizedSessions: Session[] =
    sessions?.map(session => ({
      ...session,
      trainer: Array.isArray(session.trainer) ? (session.trainer[0] ?? null) : session.trainer,
      confirmed_bookings_count: confirmedCounts.get(session.id) ?? 0,
    })) ?? []

  // Load trainers for filter dropdown (only those with sessions)
  const trainerIds = [...new Set(normalizedSessions.map(session => session.trainer_id))]

  let trainers: TrainerFilterOption[] = []

  if (trainerIds.length > 0) {
    const { data: trainerRows } = await supabase
      .from('trainers')
      .select('id, full_name')
      .in('id', trainerIds)
      .order('full_name', { ascending: true })

    trainers = trainerRows ?? []
  }

  // Apply trainer filter first
  const trainerFiltered = filterTrainerId
    ? normalizedSessions.filter(s => s.trainer_id === filterTrainerId)
    : normalizedSessions

  // Calculate status counts from trainer-filtered sessions (stable, not affected by selected statuses)
  const statusCounts: Partial<Record<DerivedSessionStatus, number>> = {}
  for (const s of trainerFiltered) {
    const ds = getDerivedSessionStatus(s)
    statusCounts[ds] = (statusCounts[ds] ?? 0) + 1
  }

  // Apply status filter on top of trainer filter
  const filtered =
    filterStatuses.length > 0
      ? trainerFiltered.filter(s => filterStatuses.includes(getDerivedSessionStatus(s)))
      : trainerFiltered

  // Sort
  const sortedSessions = sortSessions(filtered)

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
