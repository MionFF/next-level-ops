import Link from 'next/link'
import {
  derivedBookingStatusLabels,
  type BookingListRow,
  type DerivedBookingStatus,
} from '../model/booking'
import { formatDate, formatDateTime } from '@/shared/lib/format-date'
import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'
import CancelBookingButton from './cancel-booking-button'

type BookingsListProps = {
  bookings: BookingListRow[]
  errorMessage?: string
  emptyMessage?: string
}

const bookingStatusTones: Record<DerivedBookingStatus, StatusTone> = {
  confirmed: 'info',
  in_progress: 'success',
  completed: 'neutral',
  cancelled: 'danger',
}

function BookingStatusBadge({ status }: { status: BookingListRow['derived_status'] }) {
  return (
    <StatusBadge label={derivedBookingStatusLabels[status]} tone={bookingStatusTones[status]} />
  )
}

export default function BookingsList({ bookings, errorMessage, emptyMessage }: BookingsListProps) {
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
          {emptyMessage ?? 'No bookings found.'}
        </div>
      )}

      {!errorMessage && bookings.length > 0 && (
        <>
          <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] min-[1470px]:block'>
            <table className='w-full table-fixed divide-y divide-[var(--border)] text-left text-sm'>
              <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                <tr>
                  <th className='w-[11%] px-4 py-3'>Member</th>
                  <th className='w-[16%] px-4 py-3'>Email</th>
                  <th className='w-[12%] px-4 py-3'>Session</th>
                  <th className='w-[15%] px-4 py-3'>Trainer</th>
                  <th className='w-[17%] px-4 py-3'>Session starts</th>
                  <th className='w-[11%] px-4 py-3'>Status</th>
                  <th className='w-[10%] px-4 py-3'>Booked on</th>
                  <th className='w-[8%] px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[var(--border)] bg-[var(--surface)]'>
                {bookings.map(booking => {
                  return (
                    <tr
                      key={booking.id}
                      className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                    >
                      <td className='px-4 py-3 font-medium'>
                        <div className='line-clamp-2 max-w-full'>{booking.member_name}</div>
                      </td>
                      <td className='px-4 py-3 max-w-full truncate text-[var(--muted)]'>
                        {booking.member_email}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        <div className='line-clamp-2 max-w-full'>{booking.session_title}</div>
                      </td>
                      <td className='px-4 py-3 truncate max-w-full text-[var(--muted)]'>
                        {booking.trainer_name}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap font-medium text-[var(--foreground)]'>
                        {formatDateTime(booking.session_starts_at)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <BookingStatusBadge status={booking.derived_status} />
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-xs text-[var(--muted)]'>
                        {formatDate(booking.created_at)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-center'>
                        {booking.is_cancellable ? (
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

          <ul className='flex min-w-0 flex-col gap-3 min-[1470px]:hidden'>
            {bookings.map(booking => {
              return (
                <li
                  key={booking.id}
                  className='min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
                >
                  <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3'>
                    <div className='min-w-0'>
                      <p className='block max-w-full truncate font-semibold text-[var(--foreground)]'>
                        {booking.member_name}
                      </p>

                      <div className='mt-2 min-w-0 space-y-1 text-sm'>
                        <p className='max-w-full truncate text-[var(--muted)]'>
                          {booking.member_email}
                        </p>
                        <p className='max-w-full truncate text-[var(--muted)]'>
                          Session: {booking.session_title}
                        </p>
                        <p className='max-w-full truncate text-[var(--muted)]'>
                          Trainer: {booking.trainer_name}
                        </p>
                        <p className='font-medium text-[var(--foreground)]'>
                          Session starts: {formatDateTime(booking.session_starts_at)}
                        </p>
                        <p className='text-xs text-[var(--muted)]'>
                          Booked on: {formatDate(booking.created_at)}
                        </p>
                      </div>

                      <div className='mt-2'>
                        <BookingStatusBadge status={booking.derived_status} />
                      </div>
                    </div>

                    <div className='flex shrink-0 justify-end'>
                      {booking.is_cancellable ? (
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
