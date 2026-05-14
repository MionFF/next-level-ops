import CreateSessionForm from '@/features/sessions/ui/create-session-form'
import { createClient } from '@/lib/supabase/server'

export default async function NewSessionPage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, full_name')
    .eq('status', 'active')
    .order('full_name', { ascending: true })

  return <CreateSessionForm trainers={trainers ?? []} />
}
