import TrainersList from '@/features/trainers/ui/trainers-list'
import { createClient } from '@/lib/supabase/server'

export default async function trainersPage() {
  const supabase = await createClient()

  const { data: trainers, error } = await supabase
    .from('trainers')
    .select('id, full_name, email, phone, specialty, status, created_at')
    .order('created_at', { ascending: false })

  return <TrainersList trainers={trainers ?? []} errorMessage={error?.message} />
}
