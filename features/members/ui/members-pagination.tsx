import type { MemberStatus, MembershipOperationalStatus, ProfileLinkFilter } from '../model/member'
import { getMembersHref } from '../model/members-url'
import { OperationsPagination } from '@/shared/ui/pagination/operations-pagination'

type MembersPaginationProps = {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  search: string
  statuses: MemberStatus[]
  profile: ProfileLinkFilter
  memberships: MembershipOperationalStatus[]
}

export default function MembersPagination({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  search,
  statuses,
  profile,
  memberships,
}: MembersPaginationProps) {
  const getPageHref = (page: number) =>
    getMembersHref({
      page,
      search,
      statuses,
      profile,
      memberships,
    })

  return (
    <OperationsPagination
      ariaLabel='Members pagination'
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      getPageHref={getPageHref}
    />
  )
}
