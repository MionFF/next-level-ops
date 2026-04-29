import EditMemberForm from '@/features/members/ui/edit-member-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type EditMemberPageProps = {
  params: Promise<{
    memberId: string
  }>
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { memberId } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('id, full_name, email, phone, status')
    .eq('id', memberId)
    .maybeSingle()

  if (error) {
    throw new Error('Failed to load member.')
  }

  if (!member) {
    notFound()
  }

  return <EditMemberForm member={member} />
}
