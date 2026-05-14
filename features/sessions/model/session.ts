export const sessionStatuses = ['scheduled', 'cancelled'] as const

export type SessionStatus = (typeof sessionStatuses)[number]

export type Session = {
  id: string
  title: string
  trainer_id: string
  trainer: { id: string; full_name: string } | null
  starts_at: string
  ends_at: string
  capacity: number
  status: SessionStatus
  created_at: string
}

export type EditableSession = Pick<
  Session,
  'id' | 'title' | 'trainer_id' | 'starts_at' | 'ends_at' | 'capacity' | 'status'
>

export function isSessionStatus(value: string | undefined): value is SessionStatus {
  return value === 'scheduled' || value === 'cancelled'
}
