import { formatDateTime } from '@/shared/lib/format-date'
import type { CabinetUpcomingBooking } from '../model/cabinet-booking'
import { CancelOwnBookingButton } from './cancel-own-booking-button'
import { NoUpcomingBookingsCard } from './no-upcoming-bookings-card'

export function UpcomingBookingsList({ bookings }: { bookings: CabinetUpcomingBooking[] }) {
  return (
    <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-[var(--foreground)]'>Upcoming bookings</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>Your confirmed upcoming studio sessions.</p>
      </div>

      {bookings.length === 0 && <NoUpcomingBookingsCard />}

      {bookings.length > 0 && (
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] lg:block'>
            <table className='min-w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
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
                    <td className='px-4 py-3 font-medium'>
                      <div className='line-clamp-2 max-w-full'>
                        {booking.session?.title ?? 'Unknown'}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-[var(--muted)]'>
                      <div className='line-clamp-2 max-w-full'>
                        {booking.session?.trainer?.full_name ?? 'Unknown'}
                      </div>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {booking.session?.starts_at ? formatDateTime(booking.session.starts_at) : '—'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                      {booking.session?.ends_at ? formatDateTime(booking.session.ends_at) : '—'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='inline-flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)]'>
                        <span className='inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]' />
                        Confirmed
                      </span>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-right'>
                      <CancelOwnBookingButton bookingId={booking.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className='flex min-w-0 flex-col gap-3 lg:hidden'>
            {bookings.map(booking => (
              <li
                key={booking.id}
                className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
              >
                <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                  <div className='min-w-0'>
                    <p className='block max-w-full truncate font-semibold text-[var(--foreground)]'>
                      {booking.session?.title ?? 'Unknown session'}
                    </p>

                    <div className='mt-2 min-w-0 space-y-1 text-sm text-[var(--muted)]'>
                      <p className='max-w-full truncate'>
                        Trainer: {booking.session?.trainer?.full_name ?? 'Unknown'}
                      </p>
                      <p>
                        Starts:{' '}
                        {booking.session?.starts_at
                          ? formatDateTime(booking.session.starts_at)
                          : '—'}
                      </p>
                      <p>
                        Ends:{' '}
                        {booking.session?.ends_at ? formatDateTime(booking.session.ends_at) : '—'}
                      </p>
                    </div>

                    <span className='mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)]'>
                      <span className='inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]' />
                      Confirmed
                    </span>
                  </div>

                  <div className='flex shrink-0 justify-end'>
                    <CancelOwnBookingButton bookingId={booking.id} />
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
