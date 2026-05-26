'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { memberFormSchema } from '../model/member-form-schema'

export type UpdateMemberFormState = {
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    phone?: string[]
    status?: string[]
  }
}

export async function updateMember(
  memberId: string,
  _prevValue: UpdateMemberFormState,
  formData: FormData,
): Promise<UpdateMemberFormState> {
  if (!memberId) {
    return { message: 'Missing member id.' }
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
  const payload = {
    full_name: fullName,
    email,
    phone: phone || null,
    status,
  }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', memberId)
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return { message: 'A member with this email already exists.' }
    }

    return { message: 'Could not update member. Please try again.' }
  }

  if (!data) {
    return { message: 'Member was not found or could not be updated.' }
  }

  revalidatePath('/dashboard/members')
  revalidatePath(`/dashboard/members/${memberId}`)
  revalidatePath(`/dashboard/members/${memberId}/edit`)
  redirect(`/dashboard/members/${memberId}`)
}
