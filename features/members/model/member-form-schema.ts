import * as z from 'zod'
import { memberStatuses } from './member'

const phonePattern = /^(?=(?:.*\d){7,})\+?[0-9\s()-]{7,20}$/

export const memberFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters!')
    .max(100, 'Name cannot exceed 100 characters.'),
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: 'Email is incorrect!' })),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(phone => !phone || phonePattern.test(phone), {
      message: 'Phone must be a valid phone number.',
    }),
  status: z.enum(memberStatuses).default('active'),
})
