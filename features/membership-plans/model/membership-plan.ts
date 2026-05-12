export const membershipPlanStatuses = ['active', 'inactive'] as const

export type MembershipPlanStatus = (typeof membershipPlanStatuses)[number]

export type MembershipPlan = {
  id: string
  name: string
  description: string | null
  duration_days: number
  price_cents: number
  status: MembershipPlanStatus
  created_at: string
}

export type EditableMembershipPlan = Pick<
  MembershipPlan,
  'id' | 'name' | 'description' | 'duration_days' | 'price_cents' | 'status'
>

export function isMembershipPlanStatus(value: string | undefined): value is MembershipPlanStatus {
  return value === 'active' || value === 'inactive'
}
