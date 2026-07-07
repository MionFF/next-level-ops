'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  getMemberMembershipStatus,
  type StoredMemberMembershipStatus,
} from '../model/member-membership'
import { cancelMemberMembershipFormSchema } from '../model/member-membership-form-schema'

export type CancelMemberMembershipFormState = {
  message?: string
  errors?: {
    memberId?: string[]
    membershipId?: string[]
  }
}

function isStoredMemberMembershipStatus(value: string): value is StoredMemberMembershipStatus {
  return value === 'active' || value === 'cancelled'
}

export async function cancelMemberMembership(
  _prevValue: CancelMemberMembershipFormState,
  formData: FormData,
): Promise<CancelMemberMembershipFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    memberId: formData.get('memberId'),
    membershipId: formData.get('membershipId'),
  }

  const validated = cancelMemberMembershipFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { memberId, membershipId } = validated.data
  const supabase = await createClient()

  const { data: membership, error: membershipError } = await supabase
    .from('member_memberships')
    .select('id, member_id, starts_at, ends_at, status')
    .eq('id', membershipId)
    .eq('member_id', memberId)
    .maybeSingle()

  if (membershipError || !membership || !isStoredMemberMembershipStatus(membership.status)) {
    return { message: 'Selected membership was not found.' }
  }

  const derivedStatus = getMemberMembershipStatus({
    starts_at: membership.starts_at,
    ends_at: membership.ends_at,
    stored_status: membership.status,
  })

  if (derivedStatus !== 'active' && derivedStatus !== 'upcoming') {
    return { message: 'Only active or upcoming memberships can be cancelled.' }
  }

  const { error } = await supabase
    .from('member_memberships')
    .update({ status: 'cancelled' })
    .eq('id', membershipId)
    .eq('member_id', memberId)

  if (error) {
    return { message: 'Could not cancel membership. Please try again.' }
  }

  revalidatePath(`/dashboard/members/${memberId}`)

  return {}
}
