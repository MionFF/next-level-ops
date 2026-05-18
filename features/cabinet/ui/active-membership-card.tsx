import { formatDate } from '@/shared/lib/format-date'
import type { CabinetMembership } from '../model/cabinet-membership'

const DAY_MS = 24 * 60 * 60 * 1000

function daysRemaining(endsAt: string): number {
  const now = Date.now()
  const end = new Date(endsAt).getTime()
  const diff = Math.ceil((end - now) / DAY_MS)
  return Math.max(0, diff)
}

export function ActiveMembershipCard({ membership }: { membership: CabinetMembership }) {
  const remaining = daysRemaining(membership.ends_at)

  return (
    <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4'>
      <dl>
        <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
          <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
            Plan
          </dt>
          <dd className='mt-1 text-sm text-[var(--foreground)]'>{membership.plan?.name ?? '—'}</dd>
        </div>
        {membership.plan?.description && (
          <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
            <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              Description
            </dt>
            <dd className='mt-1 text-sm text-[var(--foreground)]'>{membership.plan.description}</dd>
          </div>
        )}
        <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
          <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
            Valid until
          </dt>
          <dd className='mt-1 text-sm text-[var(--foreground)]'>
            {formatDate(membership.ends_at)}
          </dd>
        </div>
        <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
          <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
            Days remaining
          </dt>
          <dd className='mt-1 text-sm text-[var(--foreground)]'>{remaining}</dd>
        </div>
        <div className='py-4'>
          <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
            Status
          </dt>
          <dd className='mt-1 text-sm capitalize text-[var(--foreground)]'>
            <span className='inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[var(--muted)]' />
              Active
            </span>
          </dd>
        </div>
      </dl>
    </div>
  )
}
