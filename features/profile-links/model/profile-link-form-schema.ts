import * as z from 'zod'

const requiredString = (message: string) =>
  z.preprocess(value => (typeof value === 'string' ? value : ''), z.string().min(1, message))

export const linkProfileMemberFormSchema = z.object({
  profileId: requiredString('Client profile is required'),
  memberId: requiredString('Member is required'),
})

export const unlinkProfileMemberFormSchema = z.object({
  profileId: requiredString('Profile is required'),
})
