import Link from 'next/link'
import { formatDate } from '@/shared/lib/format-date'
import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'
import {
  memberStatusLabels,
  membershipOperationalStatusLabels,
  type MemberOperationRow,
  type MemberStatus,
  type MembershipOperationalStatus,
} from '../model/member'

const memberStatusTones: Record<MemberStatus, StatusTone> = {
  active: 'success',
  paused: 'warning',
  inactive: 'neutral',
}

const membershipStatusTones: Record<MembershipOperationalStatus, StatusTone> = {
  active: 'success',
  upcoming: 'info',
  expired: 'neutral',
  cancelled: 'danger',
  none: 'neutral',
}

function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <StatusBadge label={memberStatusLabels[status]} tone={memberStatusTones[status]} />
}

function ProfileStatusBadge({ isLinked }: { isLinked: boolean }) {
  return (
    <StatusBadge label={isLinked ? 'Linked' : 'Unlinked'} tone={isLinked ? 'info' : 'neutral'} />
  )
}

function MembershipStatusBadge({ status }: { status: MembershipOperationalStatus }) {
  return (
    <StatusBadge
      label={membershipOperationalStatusLabels[status]}
      tone={membershipStatusTones[status]}
    />
  )
}

function MemberActions({ memberId }: { memberId: string }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <Link
        href={`/dashboard/members/${memberId}`}
        className='inline-flex min-h-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
      >
        View
      </Link>

      <Link
        href={`/dashboard/members/${memberId}/edit`}
        className='inline-flex min-h-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--primary)]/50 px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10'
      >
        Edit
      </Link>
    </div>
  )
}

export default function MembersList({
  members,
  errorMessage,
}: {
  members: MemberOperationRow[]
  errorMessage: string | undefined
}) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-2'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Members</h1>

          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage studio members and their current status.
          </p>
        </div>

        <Link
          href='/dashboard/members/new'
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Add member
        </Link>
      </div>

      {errorMessage && (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load members.
        </div>
      )}

      {!errorMessage && members.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          No members found.
        </div>
      )}

      {!errorMessage && members.length > 0 && (
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] min-[1440px]:block'>
            <table className='min-w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
              <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                <tr>
                  <th className='w-[17%] px-4 py-3'>Member</th>
                  <th className='w-[21%] px-4 py-3'>Contact</th>
                  <th className='w-[10%] px-4 py-3'>Status</th>
                  <th className='w-[10%] px-4 py-3'>Profile</th>
                  <th className='w-[18%] px-4 py-3'>Membership</th>
                  <th className='w-[11%] px-4 py-3'>Created</th>
                  <th className='w-[13%] px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>

              <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
                {members.map(member => (
                  <tr
                    key={member.id}
                    className='align-middle text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                  >
                    <td className='px-4 py-4'>
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className='line-clamp-2 font-medium text-[var(--foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline'
                      >
                        {member.full_name}
                      </Link>
                    </td>

                    <td className='px-4 py-4'>
                      <div className='min-w-0 space-y-1'>
                        <p title={member.email} className='truncate text-[var(--foreground)]'>
                          {member.email}
                        </p>

                        <p
                          title={member.phone ?? undefined}
                          className='truncate text-xs text-[var(--muted)]'
                        >
                          {member.phone ?? 'No phone'}
                        </p>
                      </div>
                    </td>

                    <td className='px-4 py-4'>
                      <MemberStatusBadge status={member.status} />
                    </td>

                    <td className='px-4 py-4'>
                      <ProfileStatusBadge isLinked={member.is_profile_linked} />
                    </td>

                    <td className='px-4 py-4'>
                      <div className='min-w-0 space-y-2'>
                        <p
                          title={member.membership_plan_name ?? undefined}
                          className='truncate text-sm text-[var(--foreground)]'
                        >
                          {member.membership_plan_name ?? 'No plan'}
                        </p>

                        <MembershipStatusBadge status={member.membership_status} />
                      </div>
                    </td>

                    <td className='whitespace-nowrap px-4 py-4 text-[var(--muted)]'>
                      {formatDate(member.created_at)}
                    </td>

                    <td className='whitespace-nowrap px-4 py-4'>
                      <MemberActions memberId={member.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className='grid min-w-0 gap-3 md:grid-cols-2 min-[1440px]:hidden'>
            {members.map(member => (
              <li
                key={member.id}
                className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
              >
                <article className='flex h-full min-w-0 flex-col'>
                  <div className='flex min-w-0 items-start justify-between gap-3'>
                    <Link
                      href={`/dashboard/members/${member.id}`}
                      className='min-w-0 truncate font-semibold text-[var(--foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline'
                    >
                      {member.full_name}
                    </Link>

                    <div className='shrink-0'>
                      <MemberStatusBadge status={member.status} />
                    </div>
                  </div>

                  <div className='mt-3 min-w-0 space-y-1 text-sm text-[var(--muted)]'>
                    <p className='truncate' title={member.email}>
                      {member.email}
                    </p>

                    <p className='truncate' title={member.phone ?? undefined}>
                      {member.phone ?? 'No phone'}
                    </p>
                  </div>

                  <dl className='mt-4 space-y-3'>
                    <div className='flex min-w-0 items-center justify-between gap-4'>
                      <dt className='shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--muted)]'>
                        Profile
                      </dt>

                      <dd className='min-w-0 text-right'>
                        <ProfileStatusBadge isLinked={member.is_profile_linked} />
                      </dd>
                    </div>

                    <div className='flex min-w-0 items-start justify-between gap-4'>
                      <dt className='shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--muted)]'>
                        Membership
                      </dt>

                      <dd className='min-w-0 text-right'>
                        <p
                          title={member.membership_plan_name ?? undefined}
                          className='mb-1.5 truncate text-sm text-[var(--foreground)]'
                        >
                          {member.membership_plan_name ?? 'No plan'}
                        </p>

                        <MembershipStatusBadge status={member.membership_status} />
                      </dd>
                    </div>
                  </dl>

                  <div className='mt-4 flex-1' />

                  <div className='pt-4'>
                    <MemberActions memberId={member.id} />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
