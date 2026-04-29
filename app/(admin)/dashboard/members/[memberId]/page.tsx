import { MemberDetails, MemberDetailsError } from '@/features/members/ui/member-details'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type MemberDetailsPageProps = {
  params: Promise<{
    memberId: string
  }>
}

export default async function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  const { memberId } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('id, full_name, email, phone, status, created_at, updated_at')
    .eq('id', memberId)
    .maybeSingle()

  if (error) {
    return <MemberDetailsError />
  }

  if (!member) {
    notFound()
  }

  return <MemberDetails member={member} />
}
