import { formatDateTime } from '@/shared/lib/format-date'
import type { CabinetUpcomingBooking } from '../model/cabinet-booking'
import { CancelOwnBookingButton } from './cancel-own-booking-button'
import { NoUpcomingBookingsCard } from './no-upcoming-bookings-card'

export function UpcomingBookingsList({ bookings }: { bookings: CabinetUpcomingBooking[] }) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Upcoming bookings</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>Your confirmed upcoming studio sessions.</p>
      </div>

      {bookings.length === 0 && <NoUpcomingBookingsCard />}

      {bookings.length > 0 && (
        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]'>
          <table className='min-w-full divide-y divide-[var(--border)] text-left text-sm'>
            <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              <tr>
                <th className='px-4 py-3'>Session</th>
                <th className='px-4 py-3'>Trainer</th>
                <th className='px-4 py-3'>Start time</th>
                <th className='px-4 py-3'>End time</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
              {bookings.map(booking => (
                <tr
                  key={booking.id}
                  className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                >
                  <td className='px-4 py-3 font-medium'>{booking.session?.title ?? 'Unknown'}</td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {booking.session?.trainer?.full_name ?? 'Unknown'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {booking.session?.starts_at ? formatDateTime(booking.session.starts_at) : '—'}
                  </td>
                  <td className='px-4 py-3 text-[var(--muted)]'>
                    {booking.session?.ends_at ? formatDateTime(booking.session.ends_at) : '—'}
                  </td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)]'>
                      <span className='inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]' />
                      Confirmed
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <CancelOwnBookingButton bookingId={booking.id} />
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
