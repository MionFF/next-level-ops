import type { DerivedSessionStatus, SessionSort } from '../model/session'
import { getSessionsHref } from '../model/sessions-url'
import { OperationsPagination } from '@/shared/ui/pagination/operations-pagination'

type SessionsPaginationProps = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  search: string
  trainer: string
  statuses: DerivedSessionStatus[]
  from: string
  to: string
  sort: SessionSort
}

export default function SessionsPagination({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  search,
  trainer,
  statuses,
  from,
  to,
  sort,
}: SessionsPaginationProps) {
  const getPageHref = (page: number) =>
    getSessionsHref({
      search,
      trainer,
      statuses,
      from,
      to,
      sort,
      page,
    })

  return (
    <OperationsPagination
      ariaLabel='Sessions pagination'
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      getPageHref={getPageHref}
    />
  )
}
