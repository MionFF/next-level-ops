import Link from 'next/link'
import { Booking, getBookingDisplayBadge, getDerivedBookingStatus } from '../model/booking'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'
import CancelBookingButton from './cancel-booking-button'

type BookingsListProps = {
  bookings: Booking[]
  errorMessage?: string
  hasActiveFilters: boolean
}

export default function BookingsList({
  bookings,
  errorMessage,
  hasActiveFilters,
}: BookingsListProps) {
  return (
    <section className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
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

      {!errorMessage && bookings.length === 0 && (
        <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--muted)]'>
          {hasActiveFilters ? 'No bookings match your filters.' : 'No bookings found.'}
        </div>
      )}

      {!errorMessage && bookings.length > 0 && (
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] xl:block'>
            <table className='min-w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
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
                {bookings.map(booking => {
                  const derived = getDerivedBookingStatus(booking)
                  const badge = getBookingDisplayBadge(derived)

                  return (
                    <tr
                      key={booking.id}
                      className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                    >
                      <td className='px-4 py-3 font-medium'>
                        <div className='line-clamp-2 max-w-full'>
                          {booking.member?.full_name ?? 'Unknown'}
                        </div>
                      </td>
                      <td className='px-4 py-3 max-w-full truncate text-[var(--muted)]'>
                        {booking.member?.email ?? '—'}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        <div className='line-clamp-2 max-w-full'>
                          {booking.session?.title ?? 'Unknown'}
                        </div>
                      </td>
                      <td className='px-4 py-3 truncate max-w-full text-[var(--muted)]'>
                        {booking.session?.trainer?.full_name ?? 'Unknown'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                        {booking.session?.starts_at
                          ? formatDateTime(booking.session.starts_at)
                          : '—'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <span
                          className={`inline-flex rounded-[var(--radius-sm)] border bg-[var(--surface-2)] px-2 py-1 text-xs font-medium capitalize ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-[var(--muted)]'>
                        {formatDate(booking.created_at)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-center'>
                        {derived === 'confirmed' ? (
                          <CancelBookingButton bookingId={booking.id} />
                        ) : (
                          <span className='text-xs text-[var(--muted)]'>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className='flex min-w-0 flex-col gap-3 xl:hidden'>
            {bookings.map(booking => {
              const derived = getDerivedBookingStatus(booking)
              const badge = getBookingDisplayBadge(derived)

              return (
                <li
                  key={booking.id}
                  className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
                >
                  <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                    <div className='min-w-0'>
                      <p className='block max-w-full truncate font-semibold text-[var(--foreground)]'>
                        {booking.member?.full_name ?? 'Unknown member'}
                      </p>

                      <div className='mt-2 min-w-0 space-y-1 text-sm text-[var(--muted)]'>
                        <p className='max-w-full truncate'>{booking.member?.email ?? '—'}</p>
                        <p className='max-w-full truncate'>
                          Session: {booking.session?.title ?? 'Unknown'}
                        </p>
                        <p className='max-w-full truncate'>
                          Trainer: {booking.session?.trainer?.full_name ?? 'Unknown'}
                        </p>
                        <p>
                          Starts:{' '}
                          {booking.session?.starts_at
                            ? formatDateTime(booking.session.starts_at)
                            : '—'}
                        </p>
                        <p>Created: {formatDate(booking.created_at)}</p>
                      </div>

                      <span
                        className={`mt-2 inline-flex rounded-[var(--radius-sm)] border bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium capitalize ${badge.className}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div className='flex shrink-0 justify-end'>
                      {derived === 'confirmed' ? (
                        <CancelBookingButton bookingId={booking.id} />
                      ) : (
                        <span className='text-xs text-[var(--muted)]'>—</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
