import { createClient } from '@/lib/supabase/server'

export type DashboardSummary = {
  totalMembers: number
  totalTrainers: number
  activePlans: number
  upcomingSessions: number
  confirmedBookings: number
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient()
  const currentTimestamp = new Date().toISOString()

  const totalMembersQuery = supabase.from('members').select('id', { count: 'exact', head: true })

  const totalTrainersQuery = supabase.from('trainers').select('id', { count: 'exact', head: true })

  const activePlansQuery = supabase
    .from('membership_plans')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const upcomingSessionsQuery = supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .gt('starts_at', currentTimestamp)

  const confirmedBookingsQuery = supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed')

  const [
    totalMembersResult,
    totalTrainersResult,
    activePlansResult,
    upcomingSessionsResult,
    confirmedBookingsResult,
  ] = await Promise.all([
    totalMembersQuery,
    totalTrainersQuery,
    activePlansQuery,
    upcomingSessionsQuery,
    confirmedBookingsQuery,
  ])

  if (totalMembersResult.error) {
    throw new Error(`Failed to fetch Dashboard total members: ${totalMembersResult.error.message}`)
  }

  if (totalTrainersResult.error) {
    throw new Error(
      `Failed to fetch Dashboard total trainers: ${totalTrainersResult.error.message}`,
    )
  }

  if (activePlansResult.error) {
    throw new Error(`Failed to fetch Dashboard active plans: ${activePlansResult.error.message}`)
  }

  if (upcomingSessionsResult.error) {
    throw new Error(
      `Failed to fetch Dashboard upcoming sessions: ${upcomingSessionsResult.error.message}`,
    )
  }

  if (confirmedBookingsResult.error) {
    throw new Error(
      `Failed to fetch Dashboard confirmed bookings: ${confirmedBookingsResult.error.message}`,
    )
  }

  return {
    totalMembers: totalMembersResult.count ?? 0,
    totalTrainers: totalTrainersResult.count ?? 0,
    activePlans: activePlansResult.count ?? 0,
    upcomingSessions: upcomingSessionsResult.count ?? 0,
    confirmedBookings: confirmedBookingsResult.count ?? 0,
  }
}
