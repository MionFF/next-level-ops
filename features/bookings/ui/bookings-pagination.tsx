import type { BookingSort, DerivedBookingStatus } from '../model/booking'
import { getBookingsHref } from '../model/bookings-url'
import { OperationsPagination } from '@/shared/ui/pagination/operations-pagination'

type BookingsPaginationProps = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  member: string
  session: string
  trainer: string
  statuses: DerivedBookingStatus[]
  from: string
  to: string
  sort: BookingSort
}

export default function BookingsPagination({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  member,
  session,
  trainer,
  statuses,
  from,
  to,
  sort,
}: BookingsPaginationProps) {
  const getPageHref = (page: number) =>
    getBookingsHref({
      member,
      session,
      trainer,
      statuses,
      from,
      to,
      sort,
      page,
    })

  return (
    <OperationsPagination
      ariaLabel='Bookings pagination'
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      getPageHref={getPageHref}
    />
  )
}
