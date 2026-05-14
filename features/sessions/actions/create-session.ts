'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sessionFormSchema } from '../model/session-form-schema'

type CreateSessionFormState = {
  message?: string
  errors?: {
    title?: string[]
    trainerId?: string[]
    startsAt?: string[]
    endsAt?: string[]
    capacity?: string[]
    status?: string[]
  }
}

export async function createSession(
  _prevValue: CreateSessionFormState,
  formData: FormData,
): Promise<CreateSessionFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    title: formData.get('title'),
    trainerId: formData.get('trainerId'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    capacity: formData.get('capacity'),
    status: formData.get('status'),
  }

  const validated = sessionFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { title, trainerId, startsAt, endsAt, capacity, status } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.from('sessions').insert({
    title,
    trainer_id: trainerId,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: new Date(endsAt).toISOString(),
    capacity,
    status,
  })

  if (error) {
    return { message: 'Could not create session. Please try again.' }
  }

  revalidatePath('/dashboard/sessions')
  redirect('/dashboard/sessions')
}
