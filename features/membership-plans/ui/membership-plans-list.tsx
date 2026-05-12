import { MembershipPlan } from '../model/membership-plan'
import { formatDate } from '@/shared/lib/format-date'

type MembershipPlansListProps = {
  plans: MembershipPlan[]
  errorMessage?: string
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default function MembershipPlansList({ plans, errorMessage }: MembershipPlansListProps) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Membership plans</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage the plans available to studio members.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load membership plans.
        </div>
      )}

      {!errorMessage && plans?.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          No membership plans found.
        </div>
      )}

      {!errorMessage && plans && plans.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Description</th>
                <th className='px-4 py-3'>Duration</th>
                <th className='px-4 py-3'>Price</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {plans.map(plan => (
                <tr
                  key={plan.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>{plan.name}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {plan.description ?? 'No description'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{plan.duration_days} days</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{formatUsd(plan.price_cents)}</td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {plan.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{formatDate(plan.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
