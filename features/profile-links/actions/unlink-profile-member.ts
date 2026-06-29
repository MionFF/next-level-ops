'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { unlinkProfileMemberFormSchema } from '../model/profile-link-form-schema'

export type UnlinkProfileMemberFormState = {
  message?: string
  errors?: {
    profileId?: string[]
  }
}

type UnlinkProfileMemberResult =
  | { ok: true }
  | {
      ok: false
      code: string
    }

const unlinkProfileMemberMessages: Record<string, string> = {
  not_admin: 'You are not allowed to unlink profiles.',
  profile_not_found: 'Selected profile was not found.',
  profile_not_client: 'Only client profiles can be unlinked from members.',
  profile_not_linked: 'This profile is not linked to a member.',
  unlink_failed: 'Could not unlink profile from member. Please try again.',
}

function isUnlinkProfileMemberResult(value: unknown): value is UnlinkProfileMemberResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (!('ok' in value) || typeof value.ok !== 'boolean') {
    return false
  }

  if (value.ok === true) {
    return true
  }

  return 'code' in value && typeof value.code === 'string'
}

export async function unlinkProfileMember(
  _prevValue: UnlinkProfileMemberFormState,
  formData: FormData,
): Promise<UnlinkProfileMemberFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    profileId: formData.get('profileId'),
  }

  const validated = unlinkProfileMemberFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { profileId } = validated.data

  const { data: result, error } = await supabase.rpc('unlink_profile_from_member', {
    p_profile_id: profileId,
  })

  if (error || !isUnlinkProfileMemberResult(result)) {
    return { message: 'Something went wrong. Please try again.' }
  }

  if (!result.ok) {
    return {
      message:
        unlinkProfileMemberMessages[result.code] ?? 'Something went wrong. Please try again.',
    }
  }

  revalidatePath('/dashboard/profile-links')

  return {}
}
