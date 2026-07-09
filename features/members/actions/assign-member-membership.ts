'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { assignMemberMembershipFormSchema } from '../model/member-membership-form-schema'

export type AssignMemberMembershipFormState = {
  message?: string
  errors?: {
    memberId?: string[]
    planId?: string[]
    startsAt?: string[]
  }
}

function getStartDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return nextDate
}

function getTodayUtcDate() {
  const now = new Date()

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function assignMemberMembership(
  _prevValue: AssignMemberMembershipFormState,
  formData: FormData,
): Promise<AssignMemberMembershipFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    memberId: formData.get('memberId'),
    planId: formData.get('planId'),
    startsAt: formData.get('startsAt'),
  }

  const validated = assignMemberMembershipFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { memberId, planId, startsAt } = validated.data
  const startsAtDate = getStartDate(startsAt)

  if (!startsAtDate) {
    return {
      message: 'Invalid form',
      errors: {
        startsAt: ['Start date is invalid'],
      },
    }
  }

  if (startsAtDate < getTodayUtcDate()) {
    return {
      message: 'Invalid form',
      errors: {
        startsAt: ['Start date cannot be in the past'],
      },
    }
  }

  if (!startsAtDate) {
    return {
      message: 'Invalid form',
      errors: {
        startsAt: ['Start date is invalid'],
      },
    }
  }

  const supabase = await createClient()

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('id', memberId)
    .maybeSingle()

  if (memberError || !member) {
    return { message: 'Selected member was not found.' }
  }

  const { data: plan, error: planError } = await supabase
    .from('membership_plans')
    .select('id, duration_days, status')
    .eq('id', planId)
    .maybeSingle()

  if (planError || !plan || plan.status !== 'active') {
    return { message: 'Selected plan is not available.' }
  }

  const endsAtDate = addDays(startsAtDate, plan.duration_days)
  const startsAtIso = startsAtDate.toISOString()
  const endsAtIso = endsAtDate.toISOString()

  const { data: overlappingMembership, error: overlapError } = await supabase
    .from('member_memberships')
    .select('id')
    .eq('member_id', memberId)
    .eq('status', 'active')
    .lt('starts_at', endsAtIso)
    .gt('ends_at', startsAtIso)
    .limit(1)
    .maybeSingle()

  if (overlapError) {
    return { message: 'Could not assign membership. Please try again.' }
  }

  if (overlappingMembership) {
    return {
      message: 'This member already has an active or scheduled membership for this period.',
    }
  }

  const { error } = await supabase.from('member_memberships').insert({
    member_id: memberId,
    plan_id: planId,
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    status: 'active',
  })

  if (error) {
    return { message: 'Could not assign membership. Please try again.' }
  }

  revalidatePath(`/dashboard/members/${memberId}`)

  return {}
}
