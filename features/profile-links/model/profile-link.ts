export type ClientProfile = {
  id: string
  full_name: string | null
  member_id: string | null
}

export type MemberOption = {
  id: string
  full_name: string
  email: string
  status: string
}

export type LinkedProfileMemberPair = {
  profile: ClientProfile
  member: MemberOption
}
