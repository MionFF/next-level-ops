import * as z from 'zod'
import { membershipPlanStatuses } from './membership-plan'

export const membershipPlanFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  description: z.string().trim().optional(),
  durationDays: z.coerce.number().int().positive('Duration must be a positive number.'),
  priceCents: z.coerce.number().int().min(0, 'Price cannot be negative.'),
  status: z.enum(membershipPlanStatuses).default('active'),
})
