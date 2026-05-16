import * as z from 'zod'

export const bookingFormSchema = z.object({
  sessionId: z.string().min(1, 'Session is required'),
  memberId: z.string().min(1, 'Member is required'),
})
