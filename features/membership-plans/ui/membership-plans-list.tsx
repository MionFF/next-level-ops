import Link from 'next/link'
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
    <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Membership plans</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage the plans available to studio members.
          </p>
        </div>
        <Link
          href='/dashboard/plans/new'
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Add plan
        </Link>
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
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] lg:block'>
            <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
              <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                <tr>
                  <th className='px-4 py-3'>Name</th>
                  <th className='px-4 py-3'>Description</th>
                  <th className='px-4 py-3'>Duration</th>
                  <th className='px-4 py-3'>Price</th>
                  <th className='px-4 py-3'>Status</th>
                  <th className='px-4 py-3'>Created</th>
                  <th className='px-4 py-3 text-right'>Actions</th>
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
                    <td className='px-4 py-3 text-right'>
                      <Link
                        href={`/dashboard/plans/${plan.id}/edit`}
                        className='inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className='flex min-w-0 flex-col gap-3 lg:hidden'>
            {plans.map(plan => (
              <li
                key={plan.id}
                className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
              >
                <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                  <div className='min-w-0'>
                    <p className='block max-w-full truncate font-semibold text-[var(--foreground)]'>
                      {plan.name}
                    </p>

                    <div className='mt-2 min-w-0 space-y-1 text-sm text-[var(--muted)]'>
                      {plan.description && (
                        <p className='max-w-full break-words'>{plan.description}</p>
                      )}
                      <p>{plan.duration_days} days</p>
                      <p>{formatUsd(plan.price_cents)}</p>
                      <p>{formatDate(plan.created_at)}</p>
                    </div>

                    <span className='mt-2 inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {plan.status}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/plans/${plan.id}/edit`}
                    className='inline-flex shrink-0 items-center justify-center self-start rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
