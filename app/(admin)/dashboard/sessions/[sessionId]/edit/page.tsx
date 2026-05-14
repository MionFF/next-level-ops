import EditSessionForm from '@/features/sessions/ui/edit-session-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type EditSessionPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, title, trainer_id, starts_at, ends_at, capacity, status, created_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    throw new Error('Failed to load session.')
  }

  if (!session) {
    notFound()
  }

  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  return <EditSessionForm session={session} trainers={trainers ?? []} />
}
