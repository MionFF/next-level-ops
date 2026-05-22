'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { membershipPlanFormSchema } from '../model/membership-plan-form-schema'

export type CreateMembershipPlanFormState = {
  message?: string
  errors?: {
    name?: string[]
    description?: string[]
    durationDays?: string[]
    priceCents?: string[]
    status?: string[]
  }
}

export async function createMembershipPlan(
  _prevValue: CreateMembershipPlanFormState,
  formData: FormData,
): Promise<CreateMembershipPlanFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    durationDays: formData.get('durationDays'),
    priceCents: formData.get('priceCents'),
    status: formData.get('status'),
  }

  const validated = membershipPlanFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { name, description, durationDays, priceCents, status } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.from('membership_plans').insert({
    name,
    description: description || null,
    duration_days: durationDays,
    price_cents: priceCents,
    status,
  })

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return { message: 'A membership plan with this name already exists.' }
    }

    return { message: 'Could not create membership plan. Please try again.' }
  }

  revalidatePath('/dashboard/plans')
  redirect('/dashboard/plans')
}
