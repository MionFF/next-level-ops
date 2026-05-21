import * as z from 'zod'
import { membershipPlanStatuses } from './membership-plan'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

export const membershipPlanFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80, 'Name cannot exceed 80 characters.'),
  description: z.string().trim().max(240, 'Description cannot exceed 240 characters.').optional(),
  durationDays: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number({ error: 'Duration is required.' })
      .int()
      .positive('Duration must be a positive number.'),
  ),
  priceCents: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number({ error: 'Price is required.' }).int().min(0, 'Price cannot be negative.'),
  ),
  status: z.enum(membershipPlanStatuses).default('active'),
})
