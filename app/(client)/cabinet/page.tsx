import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { CabinetProfile, LinkedMember } from '@/features/cabinet/model/cabinet-profile'
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

  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role, member_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profileData) {
    return (
      <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>My account</h1>
        </div>
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center'>
          <p className='text-sm text-[var(--muted)]'>Failed to load profile.</p>
        </div>
      </section>
    )
  }

  const cabinetProfile: CabinetProfile = {
    id: profileData.id,
    full_name: profileData.full_name,
    member_id: profileData.member_id,
  }

  if (!cabinetProfile.member_id) {
    return <UnlinkedMemberState />
  }

  const { data: memberData } = await supabase
    .from('members')
    .select('id, full_name, email, phone, status')
    .eq('id', cabinetProfile.member_id)
    .maybeSingle()

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

  const now = new Date().toISOString()

  const { data: membershipData } = await supabase
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
    .eq('member_id', linkedMember.id)
    .eq('status', 'active')
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at', { ascending: true })
    .limit(1)
    .maybeSingle()

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
