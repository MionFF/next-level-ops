import { Booking } from '../model/booking'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'

type BookingsListProps = {
  bookings: Booking[]
  errorMessage?: string
}

export default function BookingsList({ bookings, errorMessage }: BookingsListProps) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Bookings</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Manage member bookings for scheduled sessions.
        </p>
      </div>

      {errorMessage && (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load bookings.
        </div>
      )}

      {!errorMessage && bookings?.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          No bookings found.
        </div>
      )}

      {!errorMessage && bookings && bookings.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Member</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Session</th>
                <th className='px-4 py-3'>Trainer</th>
                <th className='px-4 py-3'>Start time</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {bookings.map(booking => (
                <tr
                  key={booking.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>
                    {booking.member?.full_name ?? 'Unknown'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>{booking.member?.email ?? '—'}</td>
                  <td className='px-4 py-3 font-medium'>{booking.session?.title ?? 'Unknown'}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {booking.session?.trainer?.full_name ?? 'Unknown'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {booking.session?.starts_at ? formatDateTime(booking.session.starts_at) : '—'}
                  </td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize text-[var(--foreground)]'>
                      {booking.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDate(booking.created_at)}
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
