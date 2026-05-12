import MembershipPlansList from '@/features/membership-plans/ui/membership-plans-list'
import { createClient } from '@/lib/supabase/server'

export default async function PlansPage() {
  const supabase = await createClient()

  const { data: plans, error } = await supabase
    .from('membership_plans')
    .select('id, name, description, duration_days, price_cents, status, created_at')
    .order('created_at', { ascending: false })

  return <MembershipPlansList plans={plans ?? []} errorMessage={error?.message} />
}
