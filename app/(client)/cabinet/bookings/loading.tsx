import { CabinetBookingsSkeleton } from '@/features/cabinet/ui/cabinet-bookings-skeleton'

export default function CabinetBookingsLoading() {
  return (
    <div role='status' aria-label='Loading cabinet bookings'>
      <span className='sr-only'>Loading cabinet bookings...</span>
      <CabinetBookingsSkeleton />
    </div>
  )
}
