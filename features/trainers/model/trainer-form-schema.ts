import * as z from 'zod'
import { trainerStatuses } from './trainer'

const phonePattern = /^(?=(?:.*\d){7,})\+?[0-9\s()-]{7,20}$/

export const trainerFormSchema = z.object({
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
  specialty: z.string().trim().max(80, 'Specialty cannot exceed 80 characters.').optional(),
  status: z.enum(trainerStatuses).default('active'),
})
