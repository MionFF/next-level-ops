'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sessionFormSchema } from '../model/session-form-schema'

export type UpdateSessionFormState = {
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

export async function updateSession(
  sessionId: string,
  _prevValue: UpdateSessionFormState,
  formData: FormData,
): Promise<UpdateSessionFormState> {
  if (!sessionId) {
    return { message: 'Missing session id' }
  }

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
  const payload = {
    title,
    trainer_id: trainerId,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: new Date(endsAt).toISOString(),
    capacity,
    status,
  }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .update(payload)
    .eq('id', sessionId)
    .select('id')
    .maybeSingle()

  if (error) {
    return { message: 'Could not update session. Please try again' }
  }

  if (!data) {
    return { message: 'Session was not found or could not be updated' }
  }

  revalidatePath('/dashboard/sessions')
  redirect('/dashboard/sessions')
}
