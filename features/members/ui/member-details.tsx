import Link from 'next/link'
import type { MemberDetails as MemberDetailsType } from '../model/member'
import { formatDate } from '@/shared/lib/format-date'

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
      <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>{label}</dt>
      <dd className='mt-1 text-sm text-[var(--foreground)]'>{value}</dd>
    </div>
  )
}

export function MemberDetails({ member }: { member: MemberDetailsType }) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Link
          href='/dashboard/members'
          className='inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Back to members
        </Link>
        <Link
          href={`/dashboard/members/${member.id}/edit`}
          className='inline-flex items-center rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Edit member
        </Link>
      </div>

      <div className='mt-6'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>Member</p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>{member.full_name}</h1>
      </div>

      <dl className='mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4'>
        <DetailItem label='Email' value={member.email} />
        <DetailItem label='Phone' value={member.phone ?? 'No phone'} />
        <DetailItem label='Status' value={member.status} />
        <DetailItem label='Created' value={formatDate(member.created_at)} />
        <DetailItem label='Updated' value={formatDate(member.updated_at)} />
      </dl>
    </section>
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
