import { isMemberStatus } from '@/features/members/model/member'
import MembersFilters from '@/features/members/ui/members-filters'
import MembersList from '@/features/members/ui/members-list'
import { createClient } from '@/lib/supabase/server'

type MembersPageProps = {
  searchParams: Promise<{
    search?: string | string[]
    status?: string | string[]
  }>
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams

  const search = getParam(params.search)?.trim() ?? ''
  const statusParam = getParam(params.status)
  const status = isMemberStatus(statusParam) ? statusParam : 'all'

  const supabase = await createClient()

  let query = supabase
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

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  const members = data ?? []

  return (
    <>
      <MembersFilters search={search} status={status} />
      <MembersList members={members} errorMessage={error?.message} />
    </>
  )
}
