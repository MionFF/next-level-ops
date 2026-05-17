export type CabinetUpcomingBooking = {
  id: string
  status: 'confirmed' | 'cancelled'
  created_at: string
  session: {
    id: string
    title: string
    starts_at: string
    ends_at: string
    trainer: {
      id: string
      full_name: string
    } | null
  } | null
}
