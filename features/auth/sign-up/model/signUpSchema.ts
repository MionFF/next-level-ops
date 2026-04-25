import * as z from 'zod'

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Name must be at least 3 characters!'),
    email: z
      .string()
      .trim()
      .pipe(z.email({ message: 'Email is incorrect!' })),
    password: z.string().trim().min(6, 'Password must be at least 6 characters!'),
    confirmPassword: z.string().trim(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  })
