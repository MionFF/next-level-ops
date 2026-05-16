import CreateBookingForm from '@/features/bookings/ui/create-booking-form'
import { createClient } from '@/lib/supabase/server'

export default async function NewBookingPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, starts_at, trainer:trainers(id, full_name)')
    .neq('status', 'cancelled')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  const { data: members } = await supabase
    .from('members')
    .select('id, full_name, email')
    .eq('status', 'active')
    .order('full_name', { ascending: true })

  const normalizedSessions =
    sessions?.map(session => ({
      ...session,
      trainer: Array.isArray(session.trainer) ? (session.trainer[0] ?? null) : session.trainer,
    })) ?? []

  return <CreateBookingForm sessions={normalizedSessions} members={members ?? []} />
}
