export type StoredMemberMembershipStatus = 'active' | 'cancelled'

export type MemberMembershipStatus = 'active' | 'upcoming' | 'expired' | 'cancelled'

export const memberMembershipStatusLabels: Record<MemberMembershipStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export type MemberMembershipPlan = {
  id: string
  name: string
  duration_days: number
  price_cents: number
}

export type MemberMembershipPlanOption = Pick<MemberMembershipPlan, 'id' | 'name' | 'duration_days'>

export type MemberMembership = {
  id: string
  starts_at: string
  ends_at: string
  stored_status: StoredMemberMembershipStatus
  derived_status: MemberMembershipStatus
  plan: MemberMembershipPlan | null
}

export function getMemberMembershipStatus(
  membership: Pick<MemberMembership, 'starts_at' | 'ends_at' | 'stored_status'>,
  now = new Date(),
): MemberMembershipStatus {
  if (membership.stored_status === 'cancelled') {
    return 'cancelled'
  }

  const startsAt = new Date(membership.starts_at)
  const endsAt = new Date(membership.ends_at)

  if (startsAt > now) {
    return 'upcoming'
  }

  if (endsAt < now) {
    return 'expired'
  }

  return 'active'
}

export function canCancelMemberMembership(membership: MemberMembership) {
  return membership.derived_status === 'active' || membership.derived_status === 'upcoming'
}

export function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getMembershipDefaultStartDate(currentMembership: MemberMembership | undefined) {
  if (currentMembership) {
    return getDateInputValue(new Date(currentMembership.ends_at))
  }

  return getDateInputValue(new Date())
}

export function getTodayDateInputValue() {
  return getDateInputValue(new Date())
}
