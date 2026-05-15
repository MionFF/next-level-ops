import Link from 'next/link'
import { Booking } from '../model/booking'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'
import CancelBookingButton from './cancel-booking-button'

type BookingsListProps = {
  bookings: Booking[]
  errorMessage?: string
}

function getBookingDisplayStatus(booking: Booking): { text: string; className: string } {
  const now = new Date()

  if (booking.status === 'cancelled') {
    return { text: 'Cancelled', className: 'border-[var(--border)] text-[var(--muted)]' }
  }

  if (booking.session?.ends_at && new Date(booking.session.ends_at) <= now) {
    return { text: 'Completed', className: 'border-[var(--border)] text-[var(--muted)]' }
  }

  if (
    booking.session?.starts_at &&
    booking.session?.ends_at &&
    new Date(booking.session.starts_at) <= now &&
    new Date(booking.session.ends_at) > now
  ) {
    return { text: 'In progress', className: 'border-[var(--primary)]/30 text-[var(--primary)]' }
  }

  return { text: 'Confirmed', className: 'border-[var(--border)] text-[var(--foreground)]' }
}

export default function BookingsList({ bookings, errorMessage }: BookingsListProps) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Bookings</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Manage member bookings for scheduled sessions.
          </p>
        </div>
        <Link
          href='/dashboard/bookings/new'
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90'
        >
          Add booking
        </Link>
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
                <th className='px-4 py-3 text-right'>Actions</th>
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
                    <span
                      className={`inline-flex rounded-[var(--radius-sm)] border bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize ${getBookingDisplayStatus(booking).className}`}
                    >
                      {getBookingDisplayStatus(booking).text}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {formatDate(booking.created_at)}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {booking.status === 'confirmed' ? (
                      <CancelBookingButton bookingId={booking.id} />
                    ) : (
                      <span className='text-xs text-[var(--muted)]'>—</span>
                    )}
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
