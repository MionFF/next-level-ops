'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from '../model/signInSchema'

type SignInFormState = {
  message?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export async function signIn(
  _prevValue: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validated = signInSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validated.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { message: error.message }

  redirect('/cabinet')
}
