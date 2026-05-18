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

  const { count: totalMembers } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })

  const { count: totalTrainers } = await supabase
    .from('trainers')
    .select('id', { count: 'exact', head: true })

  const { count: activePlans } = await supabase
    .from('membership_plans')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: upcomingSessions } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .gt('starts_at', new Date().toISOString())

  const { count: confirmedBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed')

  return {
    totalMembers: totalMembers ?? 0,
    totalTrainers: totalTrainers ?? 0,
    activePlans: activePlans ?? 0,
    upcomingSessions: upcomingSessions ?? 0,
    confirmedBookings: confirmedBookings ?? 0,
  }
}
