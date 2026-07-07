import Link from 'next/link'
import { memberStatusLabels, type MemberDetails as MemberDetailsType } from '../model/member'
import type { MemberMembership, MemberMembershipPlanOption } from '../model/member-membership'
import { formatDate } from '@/shared/lib/format-date'
import { MemberMembershipSection } from './member-membership-section'

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
      <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>{label}</dt>
      <dd className='mt-1 break-words text-sm text-[var(--foreground)]'>{value}</dd>
    </div>
  )
}

export function MemberDetails({
  member,
  memberships,
  activePlans,
}: {
  member: MemberDetailsType
  memberships: MemberMembership[]
  activePlans: MemberMembershipPlanOption[]
}) {
  return (
    <>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Link
          href='/dashboard/members'
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Back to members
        </Link>
        <Link
          href={`/dashboard/members/${member.id}/edit`}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] px-4 py-2.5 text-center text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] font-semibold transition-colors hover:bg-[var(--primary)]/90'
        >
          Edit member
        </Link>
      </div>

      <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] mt-8 p-6'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
            Member
          </p>
          <h1 className='mt-2 break-words text-2xl font-semibold text-[var(--foreground)]'>
            {member.full_name}
          </h1>
        </div>

        <dl className='mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4'>
          <DetailItem label='Email' value={member.email} />
          <DetailItem label='Phone' value={member.phone ?? 'No phone'} />
          <DetailItem label='Status' value={memberStatusLabels[member.status]} />
          <DetailItem label='Created' value={formatDate(member.created_at)} />
          <DetailItem label='Updated' value={formatDate(member.updated_at)} />
        </dl>
      </section>

      <MemberMembershipSection
        memberId={member.id}
        memberships={memberships}
        activePlans={activePlans}
      />
    </>
  )
}

export function MemberDetailsError() {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <Link
        href='/dashboard/members'
        className='inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
      >
        Back to members
      </Link>

      <div className='mt-6 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
        Failed to load member.
      </div>
    </section>
  )
}
