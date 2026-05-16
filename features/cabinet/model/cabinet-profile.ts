export type CabinetProfile = {
  id: string
  full_name: string | null
  role: 'admin' | 'client'
  member_id: string | null
}

export type LinkedMember = {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: 'active' | 'paused' | 'inactive'
}
