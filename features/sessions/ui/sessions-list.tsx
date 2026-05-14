import { Session } from '../model/session'
import { formatDate } from '@/shared/lib/format-date'

type SessionsListProps = {
  sessions: Session[]
  errorMessage?: string
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
                <th className='px-4 py-3'>Starts</th>
                <th className='px-4 py-3'>Ends</th>
                <th className='px-4 py-3'>Capacity</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
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
                  <td className='px-4 py-3 text-[var(--muted)]'>{formatDate(session.starts_at)}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{formatDate(session.ends_at)}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{session.capacity}</td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {session.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDate(session.created_at)}
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
