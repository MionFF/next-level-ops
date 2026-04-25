import * as z from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: 'Email is incorrect!' })),
  password: z.string().trim().min(6, 'Password must be at least 6 characters!'),
})
