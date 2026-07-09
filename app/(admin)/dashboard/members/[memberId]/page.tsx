import { MemberDetails, MemberDetailsError } from '@/features/members/ui/member-details'
import {
  getMemberMembershipStatus,
  type MemberMembership,
  type MemberMembershipPlanOption,
  type StoredMemberMembershipStatus,
} from '@/features/members/model/member-membership'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type MemberDetailsPageProps = {
  params: Promise<{
    memberId: string
  }>
}

type RawMemberMembership = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  plan:
    | {
        id: string
        name: string
        duration_days: number
        price_cents: number
      }
    | {
        id: string
        name: string
        duration_days: number
        price_cents: number
      }[]
    | null
}

function isStoredMemberMembershipStatus(value: string): value is StoredMemberMembershipStatus {
  return value === 'active' || value === 'cancelled'
}

function normalizeMembership(membership: RawMemberMembership): MemberMembership | null {
  if (!isStoredMemberMembershipStatus(membership.status)) {
    return null
  }

  const plan = Array.isArray(membership.plan) ? (membership.plan[0] ?? null) : membership.plan

  const normalizedMembership = {
    id: membership.id,
    starts_at: membership.starts_at,
    ends_at: membership.ends_at,
    stored_status: membership.status,
    plan,
  }

  return {
    ...normalizedMembership,
    derived_status: getMemberMembershipStatus(normalizedMembership),
  }
}

export default async function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  const { memberId } = await params
  const supabase = await createClient()

  const [
    { data: member, error: memberError },
    { data: memberships, error: membershipsError },
    { data: activePlans, error: activePlansError },
  ] = await Promise.all([
    supabase
      .from('members')
      .select('id, full_name, email, phone, status, created_at, updated_at')
      .eq('id', memberId)
      .maybeSingle(),
    supabase
      .from('member_memberships')
      .select(
        `
        id,
        starts_at,
        ends_at,
        status,
        plan:plan_id (
          id,
          name,
          duration_days,
          price_cents
        )
      `,
      )
      .eq('member_id', memberId)
      .order('starts_at', { ascending: false }),
    supabase
      .from('membership_plans')
      .select('id, name, duration_days')
      .eq('status', 'active')
      .order('name', { ascending: true }),
  ])

  if (memberError || membershipsError || activePlansError) {
    return <MemberDetailsError />
  }

  if (!member) {
    notFound()
  }

  const memberMemberships = (memberships ?? [])
    .map(membership => normalizeMembership(membership))
    .filter((membership): membership is MemberMembership => Boolean(membership))

  return (
    <MemberDetails
      member={member}
      memberships={memberMemberships}
      activePlans={(activePlans ?? []) satisfies MemberMembershipPlanOption[]}
    />
  )
}
