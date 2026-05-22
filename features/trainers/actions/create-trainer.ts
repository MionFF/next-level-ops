'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { trainerFormSchema } from '../model/trainer-form-schema'

export type CreateTrainerFormState = {
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    phone?: string[]
    specialty?: string[]
    status?: string[]
  }
}

export async function createTrainer(
  _prevValue: CreateTrainerFormState,
  formData: FormData,
): Promise<CreateTrainerFormState> {
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
  const supabase = await createClient()

  const { error } = await supabase.from('trainers').insert({
    full_name: fullName,
    email,
    phone: phone || null,
    specialty: specialty || null,
    status,
  })

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return { message: 'A trainer with this email already exists.' }
    }

    return { message: 'Could not create trainer. Please try again.' }
  }

  revalidatePath('/dashboard/trainers')
  redirect('/dashboard/trainers')
}
