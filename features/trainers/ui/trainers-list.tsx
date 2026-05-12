import Link from 'next/link'
import { Trainer } from '../model/trainer'
import { formatDate } from '@/shared/lib/format-date'

type TrainersListProps = {
  trainers: Trainer[]
  errorMessage?: string
}

export default function TrainersList({ trainers, errorMessage }: TrainersListProps) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Trainers</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage studio trainers and their current status.
          </p>
        </div>
        <Link
          href='/dashboard/trainers/new'
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Add trainer
        </Link>
      </div>

      {errorMessage && (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load trainers.
        </div>
      )}

      {!errorMessage && trainers?.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          No trainers found.
        </div>
      )}

      {!errorMessage && trainers && trainers.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Phone</th>
                <th className='px-4 py-3'>Specialty</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {trainers.map(trainer => (
                <tr
                  key={trainer.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>{trainer.full_name}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{trainer.email}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{trainer.phone ?? 'No phone'}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {trainer.specialty ?? 'No specialty'}
                  </td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {trainer.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDate(trainer.created_at)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <Link
                      href={`/dashboard/trainers/${trainer.id}/edit`}
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
