export const trainerStatuses = ['active', 'inactive'] as const

export type TrainerStatus = (typeof trainerStatuses)[number]

export type Trainer = {
  id: string
  full_name: string
  email: string
  phone: string | null
  specialty: string | null
  status: TrainerStatus
  created_at: string
}

export type EditableTrainer = Pick<
  Trainer,
  'id' | 'full_name' | 'email' | 'phone' | 'specialty' | 'status'
>

export function isTrainerStatus(value: string | undefined): value is TrainerStatus {
  return value === 'active' || value === 'inactive'
}
