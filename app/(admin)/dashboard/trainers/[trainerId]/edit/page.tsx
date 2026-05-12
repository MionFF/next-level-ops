import EditTrainerForm from '@/features/trainers/ui/edit-trainer-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type EditTrainerPageProps = {
  params: Promise<{
    trainerId: string
  }>
}

export default async function EditTrainerPage({ params }: EditTrainerPageProps) {
  const { trainerId } = await params
  const supabase = await createClient()

  const { data: trainer, error } = await supabase
    .from('trainers')
    .select('id, full_name, email, phone, specialty, status, created_at')
    .eq('id', trainerId)
    .maybeSingle()

  if (error) {
    throw new Error('Failed to load trainer.')
  }

  if (!trainer) {
    notFound()
  }

  return <EditTrainerForm trainer={trainer} />
}
