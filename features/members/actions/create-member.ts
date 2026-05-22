'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { memberFormSchema } from '../model/member-form-schema'

export type CreateMemberFormState = {
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    phone?: string[]
    status?: string[]
  }
}

export async function createMember(
  _prevValue: CreateMemberFormState,
  formData: FormData,
): Promise<CreateMemberFormState> {
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
    status: formData.get('status'),
  }

  const validated = memberFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, phone, status } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.from('members').insert({
    full_name: fullName,
    email,
    phone: phone || null,
    status,
  })

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return { message: 'A member with this email already exists.' }
    }

    return { message: 'Could not create member. Please try again.' }
  }

  revalidatePath('/dashboard/members')
  redirect('/dashboard/members')
}
