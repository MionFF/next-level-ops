import type {
  ClientProfile,
  LinkedProfileMemberPair,
  MemberOption,
} from '@/features/profile-links/model/profile-link'
import ProfileLinksOverview from '@/features/profile-links/ui/profile-links-overview'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileLinksPage() {
  const supabase = await createClient()

  const [{ data: profiles, error: profilesError }, { data: members, error: membersError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, member_id')
        .eq('role', 'client')
        .order('created_at', { ascending: false }),
      supabase
        .from('members')
        .select('id, full_name, email, status')
        .order('full_name', { ascending: true }),
    ])

  const clientProfiles: ClientProfile[] = profiles ?? []
  const memberOptions: MemberOption[] = members ?? []

  const membersById = new Map(memberOptions.map(member => [member.id, member]))

  const linkedMemberIds = new Set(
    clientProfiles
      .map(profile => profile.member_id)
      .filter((memberId): memberId is string => Boolean(memberId)),
  )

  const unlinkedProfiles = clientProfiles.filter(profile => !profile.member_id)
  const unlinkedMembers = memberOptions.filter(member => !linkedMemberIds.has(member.id))

  const linkedPairs: LinkedProfileMemberPair[] = clientProfiles.flatMap(profile => {
    if (!profile.member_id) {
      return []
    }

    const member = membersById.get(profile.member_id)

    if (!member) {
      return []
    }

    return [
      {
        profile: {
          ...profile,
          member_id: profile.member_id,
        },
        member,
      },
    ]
  })

  return (
    <ProfileLinksOverview
      unlinkedProfiles={unlinkedProfiles}
      unlinkedMembers={unlinkedMembers}
      linkedPairs={linkedPairs}
      errorMessage={profilesError?.message ?? membersError?.message}
    />
  )
}
