'use server'

import { createClient } from '@/lib/supabase/server'
import { signUpSchema } from '../model/signUpSchema'
import { redirect } from 'next/navigation'

type SignUpFormState = {
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

export async function signUp(
  _prevValue: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const validated = signUpSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, password } = validated.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) return { message: error.message }

  redirect('/cabinet')
}
