import EditMembershipPlanForm from '@/features/membership-plans/ui/edit-membership-plan-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type EditMembershipPlanPageProps = {
  params: Promise<{
    planId: string
  }>
}

export default async function EditMembershipPlanPage({ params }: EditMembershipPlanPageProps) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('membership_plans')
    .select('id, name, description, duration_days, price_cents, status, created_at')
    .eq('id', planId)
    .maybeSingle()

  if (error) {
    throw new Error('Failed to load membership plan.')
  }

  if (!plan) {
    notFound()
  }

  return <EditMembershipPlanForm plan={plan} />
}
