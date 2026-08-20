import Link from 'next/link'
import {
  derivedSessionStatusLabels,
  type DerivedSessionStatus,
  type SessionListRow,
} from '../model/session'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'
import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

type SessionsListProps = {
  sessions: SessionListRow[]
  errorMessage?: string
  emptyMessage?: string
}

const sessionStatusTones: Record<DerivedSessionStatus, StatusTone> = {
  scheduled: 'info',
  in_progress: 'success',
  full: 'warning',
  completed: 'neutral',
  cancelled: 'danger',
}

function SessionStatusBadge({ status }: { status: SessionListRow['derived_status'] }) {
  return (
    <StatusBadge label={derivedSessionStatusLabels[status]} tone={sessionStatusTones[status]} />
  )
}

export default function SessionsList({ sessions, errorMessage, emptyMessage }: SessionsListProps) {
  return (
    <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Sessions</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage scheduled studio sessions and capacity.
          </p>
        </div>
        <Link
          href='/dashboard/sessions/new'
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Add session
        </Link>
      </div>

      {errorMessage && (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load sessions.
        </div>
      )}

      {!errorMessage && sessions?.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          {emptyMessage ?? 'No sessions found.'}
        </div>
      )}

      {!errorMessage && sessions && sessions.length > 0 && (
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] min-[1470px]:block'>
            <table className='w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
              <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                <tr>
                  <th className='w-[14%] px-4 py-3'>Title</th>
                  <th className='w-[14%] px-4 py-3'>Trainer</th>
                  <th className='w-[16%] px-4 py-3'>Starts</th>
                  <th className='w-[16%] px-4 py-3'>Ends</th>
                  <th className='w-[12%] px-4 py-3'>Capacity</th>
                  <th className='w-[13%] px-4 py-3'>Status</th>
                  <th className='w-[8%] px-4 py-3'>Created on</th>
                  <th className='w-[7%] px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
                {sessions.map(session => (
                  <tr
                    key={session.id}
                    className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                  >
                    <td className='px-4 py-3 font-medium'>
                      <div className='line-clamp-2 max-w-full'>{session.title}</div>
                    </td>
                    <td className='px-4 py-3 text-[var(--muted)]'>
                      <div className='line-clamp-2 max-w-full'>{session.trainer_name}</div>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap font-medium text-[var(--foreground)]'>
                      {formatDateTime(session.starts_at)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {formatDateTime(session.ends_at)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {session.confirmed_bookings_count} / {session.capacity} booked
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <SessionStatusBadge status={session.derived_status} />
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-xs text-[var(--muted)]'>
                      {formatDate(session.created_at)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-right'>
                      <Link
                        href={`/dashboard/sessions/${session.id}/edit`}
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

          <ul className='flex min-w-0 flex-col gap-3 min-[1470px]:hidden'>
            {sessions.map(session => (
              <li
                key={session.id}
                className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
              >
                <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                  <div className='min-w-0'>
                    <p className='block max-w-full truncate font-semibold text-[var(--foreground)]'>
                      {session.title}
                    </p>

                    <div className='mt-2 min-w-0 space-y-1 text-sm'>
                      <p className='max-w-full truncate text-[var(--muted)]'>
                        Trainer: {session.trainer_name}
                      </p>
                      <p className='font-medium text-[var(--foreground)]'>
                        Starts: {formatDateTime(session.starts_at)}
                      </p>
                      <p className='text-[var(--muted)]'>Ends: {formatDateTime(session.ends_at)}</p>
                      <p className='text-[var(--muted)]'>
                        Capacity: {session.confirmed_bookings_count} / {session.capacity} booked
                      </p>
                      <p className='text-xs text-[var(--muted)]'>
                        Created on: {formatDate(session.created_at)}
                      </p>
                    </div>

                    <div className='mt-2'>
                      <SessionStatusBadge status={session.derived_status} />
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/sessions/${session.id}/edit`}
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
