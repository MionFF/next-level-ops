import Link from 'next/link'
import { Session } from '../model/session'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'

type SessionsListProps = {
  sessions: Session[]
  errorMessage?: string
}

function getSessionDisplayStatus(session: Session): { text: string; className: string } {
  const now = new Date()

  if (session.status === 'cancelled') {
    return {
      text: 'Cancelled',
      className: 'border-[var(--border)] text-[var(--muted)]',
    }
  }

  if (new Date(session.ends_at) <= now) {
    return {
      text: 'Completed',
      className: 'border-[var(--border)] text-[var(--muted)]',
    }
  }

  if (new Date(session.starts_at) <= now && new Date(session.ends_at) > now) {
    return {
      text: 'In progress',
      className: 'border-[var(--primary)]/30 text-[var(--primary)]',
    }
  }

  if (session.confirmed_bookings_count >= session.capacity) {
    return {
      text: 'Full',
      className: 'border-[var(--danger)]/30 text-[var(--danger)]',
    }
  }

  return {
    text: 'Scheduled',
    className: 'border-[var(--border)] text-[var(--foreground)]',
  }
}

function DisplayBadge({ session }: { session: Session }) {
  const { text, className } = getSessionDisplayStatus(session)
  return (
    <span
      className={`inline-flex rounded-[var(--radius-sm)] border bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize ${className}`}
    >
      {text}
    </span>
  )
}

export default function SessionsList({ sessions, errorMessage }: SessionsListProps) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
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
          No sessions found.
        </div>
      )}

      {!errorMessage && sessions && sessions.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Title</th>
                <th className='px-4 py-3'>Trainer</th>
                <th className='px-4 py-3'>Start time</th>
                <th className='px-4 py-3'>End time</th>
                <th className='px-4 py-3'>Capacity</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {sessions.map(session => (
                <tr
                  key={session.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>{session.title}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {session.trainer?.full_name ?? 'Unknown'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDateTime(session.starts_at)}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDateTime(session.ends_at)}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {session.confirmed_bookings_count} / {session.capacity} booked
                  </td>
                  <td className='px-4 py-3'>
                    <DisplayBadge session={session} />
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDate(session.created_at)}
                  </td>
                  <td className='px-4 py-3 text-right'>
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
      )}
    </section>
  )
}
