import { formatDate } from '@/shared/lib/format-date'
import {
  canCancelMemberMembership,
  getMembershipDefaultStartDate,
  getTodayDateInputValue,
  memberMembershipStatusLabels,
  type MemberMembership,
  type MemberMembershipPlanOption,
  type MemberMembershipStatus,
} from '../model/member-membership'
import { AssignMemberMembershipForm } from './assign-member-membership-form'
import { CancelMemberMembershipButton } from './cancel-member-membership-button'

function EmptyState({ message }: { message: string }) {
  return (
    <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-4 text-sm text-[var(--muted)]'>
      {message}
    </div>
  )
}

function MembershipStatus({ status }: { status: MemberMembershipStatus }) {
  return (
    <span className='text-sm font-medium text-[var(--foreground)]'>
      {memberMembershipStatusLabels[status]}
    </span>
  )
}

function MembershipPlanName({ membership }: { membership: MemberMembership }) {
  return (
    <span className='break-words font-medium text-[var(--foreground)]'>
      {membership.plan?.name ?? 'Unknown plan'}
    </span>
  )
}

function MembershipMobileCard({
  membership,
  memberId,
  canShowCancel,
}: {
  membership: MemberMembership
  memberId: string
  canShowCancel: boolean
}) {
  return (
    <li className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4'>
      <div className='border-b border-[var(--border)] py-3'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>Plan</p>
        <p className='mt-1 text-sm'>
          <MembershipPlanName membership={membership} />
        </p>
      </div>

      <div className='border-b border-[var(--border)] py-3'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>Period</p>
        <p className='mt-1 text-sm text-[var(--foreground)]'>
          {formatDate(membership.starts_at)}
          <span className='mx-2 text-[var(--muted)]'>→</span>
          {formatDate(membership.ends_at)}
        </p>
      </div>

      <div className={canShowCancel ? 'border-b border-[var(--border)] py-3' : 'py-3'}>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>Status</p>
        <p className='mt-1'>
          <MembershipStatus status={membership.derived_status} />
        </p>
      </div>

      {canShowCancel && (
        <div className='py-3'>
          <CancelMemberMembershipButton memberId={memberId} membershipId={membership.id} />
        </div>
      )}
    </li>
  )
}

function MembershipTable({
  memberships,
  memberId,
  getCanShowCancel,
}: {
  memberships: MemberMembership[]
  memberId: string
  getCanShowCancel: (membership: MemberMembership) => boolean
}) {
  return (
    <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] lg:block'>
      <table className='min-w-full table-fixed divide-y divide-[var(--border)] bg-[var(--surface-2)] text-left text-sm'>
        <thead className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          <tr>
            <th className='w-[34%] px-4 py-3'>Plan</th>
            <th className='w-[18%] px-4 py-3'>Starts</th>
            <th className='w-[18%] px-4 py-3'>Ends</th>
            <th className='w-[15%] px-4 py-3'>Status</th>
            <th className='w-[15%] px-4 py-3 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-[var(--border)]'>
          {memberships.map(membership => {
            const canShowCancel = getCanShowCancel(membership)

            return (
              <tr key={membership.id} className='text-[var(--foreground)]'>
                <td className='px-4 py-3'>
                  <MembershipPlanName membership={membership} />
                </td>
                <td className='px-4 py-3 text-[var(--muted)]'>
                  {formatDate(membership.starts_at)}
                </td>
                <td className='px-4 py-3 text-[var(--muted)]'>{formatDate(membership.ends_at)}</td>
                <td className='px-4 py-3'>
                  <MembershipStatus status={membership.derived_status} />
                </td>
                <td className='px-4 py-3 text-right'>
                  {canShowCancel ? (
                    <div className='flex justify-end'>
                      <CancelMemberMembershipButton
                        memberId={memberId}
                        membershipId={membership.id}
                      />
                    </div>
                  ) : (
                    <span className='text-sm text-[var(--muted)]'>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MembershipList({
  memberships,
  memberId,
  getCanShowCancel,
}: {
  memberships: MemberMembership[]
  memberId: string
  getCanShowCancel: (membership: MemberMembership) => boolean
}) {
  return (
    <>
      <MembershipTable
        memberships={memberships}
        memberId={memberId}
        getCanShowCancel={getCanShowCancel}
      />

      <ul className='grid gap-3 lg:hidden'>
        {memberships.map(membership => (
          <MembershipMobileCard
            key={membership.id}
            membership={membership}
            memberId={memberId}
            canShowCancel={getCanShowCancel(membership)}
          />
        ))}
      </ul>
    </>
  )
}

function CurrentMembership({
  membership,
  memberId,
}: {
  membership: MemberMembership | undefined
  memberId: string
}) {
  if (!membership) {
    return <EmptyState message='No active membership.' />
  }

  return (
    <MembershipList
      memberships={[membership]}
      memberId={memberId}
      getCanShowCancel={candidate => canCancelMemberMembership(candidate)}
    />
  )
}

function MembershipHistory({
  memberships,
  currentMembershipId,
  memberId,
}: {
  memberships: MemberMembership[]
  currentMembershipId: string | undefined
  memberId: string
}) {
  if (memberships.length === 0) {
    return <EmptyState message='No membership history.' />
  }

  return (
    <MembershipList
      memberships={memberships}
      memberId={memberId}
      getCanShowCancel={membership =>
        membership.id !== currentMembershipId && membership.derived_status === 'upcoming'
      }
    />
  )
}

export function MemberMembershipSection({
  memberId,
  memberships,
  activePlans,
}: {
  memberId: string
  memberships: MemberMembership[]
  activePlans: MemberMembershipPlanOption[]
}) {
  const currentMembership = memberships.find(membership => membership.derived_status === 'active')
  const defaultStartDate = getMembershipDefaultStartDate(currentMembership)
  const minStartDate = getTodayDateInputValue()

  return (
    <section className='mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Membership
        </p>
        <h2 className='mt-2 text-xl font-semibold text-[var(--foreground)]'>Membership</h2>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]'>
          Assigned memberships for this studio member.
        </p>
      </div>

      <div className='mt-6 space-y-6'>
        <AssignMemberMembershipForm
          memberId={memberId}
          plans={activePlans}
          defaultStartDate={defaultStartDate}
          minStartDate={minStartDate}
          isRenewal={Boolean(currentMembership)}
        />

        <section className='space-y-3'>
          <h3 className='text-base font-semibold text-[var(--foreground)]'>Current membership</h3>

          <CurrentMembership membership={currentMembership} memberId={memberId} />
        </section>

        <section className='space-y-3'>
          <h3 className='text-base font-semibold text-[var(--foreground)]'>Membership history</h3>

          <MembershipHistory
            memberships={memberships}
            currentMembershipId={currentMembership?.id}
            memberId={memberId}
          />
        </section>
      </div>
    </section>
  )
}
