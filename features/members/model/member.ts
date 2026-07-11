export const memberStatuses = ['active', 'paused', 'inactive'] as const

export const memberStatusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  inactive: 'Inactive',
}

export const membershipOperationalStatuses = [
  'active',
  'upcoming',
  'expired',
  'cancelled',
  'none',
] as const

export type MemberStatus = (typeof memberStatuses)[number]
export type MemberStatusFilter = MemberStatus | 'all'

export type MembershipOperationalStatus = (typeof membershipOperationalStatuses)[number]

export type Member = {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: MemberStatus
  created_at: string
}

export type MemberOperationRow = Member & {
  is_profile_linked: boolean
  membership_status: MembershipOperationalStatus
  membership_plan_name: string | null
  membership_starts_at: string | null
  membership_ends_at: string | null
}

export type MemberDetails = Member & {
  updated_at: string
}

export type EditableMember = Pick<Member, 'id' | 'full_name' | 'email' | 'phone' | 'status'>

export function isMemberStatus(value: string | undefined): value is MemberStatus {
  return value === 'active' || value === 'paused' || value === 'inactive'
}
