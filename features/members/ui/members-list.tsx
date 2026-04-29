import Link from 'next/link'
import { Member } from '../model/member'
import { formatDate } from '@/shared/lib/format-date'

export default function MembersList({
  members,
  errorMessage,
}: {
  members: Member[]
  errorMessage: string | undefined
}) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
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

      {!errorMessage && members?.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          No members found.
        </div>
      )}

      {!errorMessage && members && members.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Phone</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {members.map(member => (
                <tr
                  key={member.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>
                    <Link
                      href={`/dashboard/members/${member.id}`}
                      className='font-medium text-[var(--foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline'
                    >
                      {member.full_name}
                    </Link>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{member.email}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{member.phone ?? 'No phone'}</td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {member.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{formatDate(member.created_at)}</td>
                  <td className='px-4 py-3 text-right'>
                    <Link
                      href={`/dashboard/members/${member.id}/edit`}
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
