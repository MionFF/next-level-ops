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
    <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
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
        <>
          {/* Desktop table — lg+ */}
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] xl:block'>
            <table className='min-w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
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
                      <div className='line-clamp-2 max-w-full'>
                        <Link
                          href={`/dashboard/members/${member.id}`}
                          className='font-medium text-[var(--foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline'
                        >
                          {member.full_name}
                        </Link>
                      </div>
                    </td>
                    <td className='px-4 py-3 max-w-full truncate text-[var(--muted)]'>
                      {member.email}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {member.phone ?? 'No phone'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                        {member.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {formatDate(member.created_at)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-right'>
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

          {/* Mobile card list — below lg */}
          <ul className='flex min-w-0 flex-col gap-3 xl:hidden'>
            {members.map(member => (
              <li
                key={member.id}
                className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
              >
                <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                  <div className='min-w-0'>
                    <Link
                      href={`/dashboard/members/${member.id}`}
                      className='block max-w-full truncate font-semibold text-[var(--foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline'
                    >
                      {member.full_name}
                    </Link>

                    <div className='mt-2 min-w-0 space-y-1 text-sm text-[var(--muted)]'>
                      {member.email && <p className='max-w-full truncate'>{member.email}</p>}
                      {member.phone && <p className='max-w-full truncate'>{member.phone}</p>}
                      <p>{formatDate(member.created_at)}</p>
                    </div>

                    <span className='mt-2 inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {member.status}
                    </span>
                  </div>

                  <div className='flex shrink-0 flex-col gap-2'>
                    <Link
                      href={`/dashboard/members/${member.id}`}
                      className='inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/members/${member.id}/edit`}
                      className='inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
