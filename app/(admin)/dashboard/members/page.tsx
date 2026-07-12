import { isMemberStatus } from '@/features/members/model/member'
import { getMembersHref } from '@/features/members/model/members-url'
import MembersFilters from '@/features/members/ui/members-filters'
import MembersList from '@/features/members/ui/members-list'
import MembersPagination from '@/features/members/ui/members-pagination'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PAGE_SIZE = 10

type MembersPageProps = {
  searchParams: Promise<{
    search?: string | string[]
    status?: string | string[]
    page?: string | string[]
  }>
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getPage(value: string | undefined) {
  if (!value) {
    return 1
  }

  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return page
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams

  const search = getParam(params.search)?.trim() ?? ''
  const statusParam = getParam(params.status)
  const status = isMemberStatus(statusParam) ? statusParam : 'all'
  const page = getPage(getParam(params.page))

  const supabase = await createClient()

  let countQuery = supabase.from('member_operations').select('id', {
    count: 'exact',
    head: true,
  })

  if (search) {
    countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (status !== 'all') {
    countQuery = countQuery.eq('status', status)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    return (
      <>
        <MembersFilters search={search} status={status} />
        <MembersList members={[]} errorMessage={countError.message} />
      </>
    )
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (page > totalPages) {
    redirect(
      getMembersHref({
        search,
        status,
        page: totalPages,
      }),
    )
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let membersQuery = supabase
    .from('member_operations')
    .select(
      `
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        is_profile_linked,
        membership_status,
        membership_plan_name,
        membership_starts_at,
        membership_ends_at
      `,
    )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to)

  if (search) {
    membersQuery = membersQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (status !== 'all') {
    membersQuery = membersQuery.eq('status', status)
  }

  const { data, error } = await membersQuery

  const members = data ?? []

  return (
    <>
      <MembersFilters search={search} status={status} />

      <MembersList members={members} errorMessage={error?.message} />

      {!error && totalCount > 0 && (
        <MembersPagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          search={search}
          status={status}
        />
      )}
    </>
  )
}
