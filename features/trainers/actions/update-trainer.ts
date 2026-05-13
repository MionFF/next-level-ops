'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { trainerFormSchema } from '../model/trainer-form-schema'

type UpdateTrainerFormState = {
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    phone?: string[]
    specialty?: string[]
    status?: string[]
  }
}

export async function updateTrainer(
  trainerId: string,
  _prevValue: UpdateTrainerFormState,
  formData: FormData,
): Promise<UpdateTrainerFormState> {
  if (!trainerId) {
    return { message: 'Missing trainer id.' }
  }

  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    specialty: formData.get('specialty'),
    status: formData.get('status'),
  }

  const validated = trainerFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, phone, specialty, status } = validated.data
  const payload = {
    full_name: fullName,
    email,
    phone: phone || null,
    specialty: specialty || null,
    status,
  }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('trainers')
    .update(payload)
    .eq('id', trainerId)
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return { message: 'A trainer with this email already exists.' }
    }

    return { message: 'Could not update trainer. Please try again.' }
  }

  if (!data) {
    return { message: 'Trainer was not found or could not be updated.' }
  }

  revalidatePath('/dashboard/trainers')
  redirect('/dashboard/trainers')
}
