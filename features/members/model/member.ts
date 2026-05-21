export const memberStatuses = ['active', 'paused', 'inactive'] as const
export const memberStatusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  inactive: 'Inactive',
}

export type MemberStatus = (typeof memberStatuses)[number]
export type MemberStatusFilter = MemberStatus | 'all'

export type Member = {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: MemberStatus
  created_at: string
}

export type MemberDetails = Member & {
  updated_at: string
}

export type EditableMember = Pick<Member, 'id' | 'full_name' | 'email' | 'phone' | 'status'>

export function isMemberStatus(value: string | undefined): value is MemberStatus {
  return value === 'active' || value === 'paused' || value === 'inactive'
}
