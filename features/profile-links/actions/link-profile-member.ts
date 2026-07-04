'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { linkProfileMemberFormSchema } from '../model/profile-link-form-schema'

export type LinkProfileMemberFormState = {
  message?: string
  errors?: {
    profileId?: string[]
    memberId?: string[]
  }
}

type LinkProfileMemberResult =
  | { ok: true }
  | {
      ok: false
      code: string
    }

const linkProfileMemberMessages: Record<string, string> = {
  not_admin: 'You are not allowed to link profiles.',
  profile_not_found: 'Selected profile was not found.',
  profile_not_client: 'Only client profiles can be linked to members.',
  profile_already_linked: 'This profile is already linked to a member.',
  member_not_found: 'Selected member was not found.',
  member_already_linked: 'This member is already linked to another profile.',
  link_failed: 'Could not link profile to member. Please try again.',
}

function isLinkProfileMemberResult(value: unknown): value is LinkProfileMemberResult {
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

export async function linkProfileMember(
  _prevValue: LinkProfileMemberFormState,
  formData: FormData,
): Promise<LinkProfileMemberFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    profileId: formData.get('profileId'),
    memberId: formData.get('memberId'),
  }

  const validated = linkProfileMemberFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { profileId, memberId } = validated.data

  const { data: result, error } = await supabase.rpc('link_profile_to_member', {
    p_profile_id: profileId,
    p_member_id: memberId,
  })

  if (error || !isLinkProfileMemberResult(result)) {
    return { message: 'Something went wrong. Please try again.' }
  }

  if (!result.ok) {
    return {
      message: linkProfileMemberMessages[result.code] ?? 'Something went wrong. Please try again.',
    }
  }

  revalidatePath('/dashboard/profile-links')

  return {}
}
