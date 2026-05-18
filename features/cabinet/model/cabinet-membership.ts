export type CabinetMembership = {
  id: string
  starts_at: string
  ends_at: string
  status: 'active' | 'cancelled'
  plan: {
    id: string
    name: string
    description: string | null
    duration_days: number
    price_cents: number
  } | null
}
