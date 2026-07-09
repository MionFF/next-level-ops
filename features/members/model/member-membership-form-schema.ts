import * as z from 'zod'

const requiredString = (message: string) =>
  z.preprocess(value => (typeof value === 'string' ? value : ''), z.string().min(1, message))

export const assignMemberMembershipFormSchema = z.object({
  memberId: requiredString('Member is required'),
  planId: requiredString('Membership plan is required'),
  startsAt: requiredString('Start date is required'),
})

export const cancelMemberMembershipFormSchema = z.object({
  memberId: requiredString('Member is required'),
  membershipId: requiredString('Membership is required'),
})
