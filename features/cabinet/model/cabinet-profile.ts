export type LinkedMember = {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: 'active' | 'paused' | 'inactive'
}
