import * as z from 'zod'
import { sessionStatuses } from './session'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

export const sessionFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    trainerId: z.string().min(1, 'Trainer is required'),
    startsAt: z.string().min(1, 'Start time is required'),
    endsAt: z.string().min(1, 'End time is required'),
    capacity: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number({ error: 'Capacity is required' })
        .int('Capacity must be a whole number')
        .positive('Capacity must be at least 1'),
    ),
    status: z.enum(sessionStatuses).default('scheduled'),
  })
  .refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  })
