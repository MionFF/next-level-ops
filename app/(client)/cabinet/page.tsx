import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LinkedMember } from '@/features/cabinet/model/cabinet-profile'
import type { CabinetMembership } from '@/features/cabinet/model/cabinet-membership'
import { UnlinkedMemberState } from '@/features/cabinet/ui/unlinked-member-state'
import { LinkedMemberOverview } from '@/features/cabinet/ui/linked-member-overview'
import { ActiveMembershipCard } from '@/features/cabinet/ui/active-membership-card'
import { NoActiveMembershipCard } from '@/features/cabinet/ui/no-active-membership-card'
import { isMemberStatus } from '@/features/members/model/member'

export default async function CabinetPage() {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    return redirect('/sign-in')
  }

  if (profile?.role !== 'client') {
    return redirect('/forbidden')
  }

  if (!profile.member_id) {
    return <UnlinkedMemberState />
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const memberQuery = supabase
    .from('members')
    .select('id, full_name, email, phone, status')
    .eq('id', profile.member_id)
    .maybeSingle()

  const membershipQuery = supabase
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
        description,
        duration_days,
        price_cents
      )
    `,
    )
    .eq('member_id', profile.member_id)
    .eq('status', 'active')
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const [memberResult, membershipResult] = await Promise.all([memberQuery, membershipQuery])
  const { data: memberData } = memberResult

  if (!memberData || !isMemberStatus(memberData.status)) {
    return <UnlinkedMemberState />
  }

  const linkedMember: LinkedMember = {
    id: memberData.id,
    full_name: memberData.full_name,
    email: memberData.email,
    phone: memberData.phone,
    status: memberData.status,
  }

  const { data: membershipData } = membershipResult

  const activeMembership: CabinetMembership | null = membershipData
    ? {
        ...membershipData,
        plan: Array.isArray(membershipData.plan)
          ? (membershipData.plan[0] ?? null)
          : membershipData.plan,
      }
    : null

  return (
    <>
      <LinkedMemberOverview member={linkedMember} />

      <section className='mt-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
        <h2 className='mb-3 text-lg font-semibold text-[var(--foreground)]'>Active membership</h2>
        {activeMembership ? (
          <ActiveMembershipCard membership={activeMembership} />
        ) : (
          <NoActiveMembershipCard />
        )}
      </section>
    </>
  )
}
