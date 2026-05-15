import { Session } from '@/features/sessions/model/session'
import SessionsList from '@/features/sessions/ui/sessions-list'
import { createClient } from '@/lib/supabase/server'

export default async function SessionsPage() {
  const supabase = await createClient()

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(
      'id, title, trainer_id, starts_at, ends_at, capacity, status, created_at, trainer:trainers(id, full_name)',
    )
    .order('starts_at', { ascending: true })

  const { data: confirmedBookings } = await supabase
    .from('bookings')
    .select('session_id, id')
    .eq('status', 'confirmed')

  const confirmedCounts = new Map<string, number>()
  for (const booking of confirmedBookings ?? []) {
    confirmedCounts.set(booking.session_id, (confirmedCounts.get(booking.session_id) ?? 0) + 1)
  }

  const normalizedSessions: Session[] =
    sessions?.map(session => ({
      ...session,
      trainer: Array.isArray(session.trainer) ? (session.trainer[0] ?? null) : session.trainer,
      confirmed_bookings_count: confirmedCounts.get(session.id) ?? 0,
    })) ?? []

  return <SessionsList sessions={normalizedSessions} errorMessage={error?.message} />
}
