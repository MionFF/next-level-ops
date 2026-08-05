import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { isAuthRole, type AuthRole } from './auth-role'

type AuthProfile = {
  role: AuthRole | null
  member_id: string | null
}

async function loadAuthProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profileData } = await supabase
    .schema('public')
    .from('profiles')
    .select('role, member_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile: AuthProfile | null = profileData
    ? {
        role: isAuthRole(profileData.role) ? profileData.role : null,
        member_id: typeof profileData.member_id === 'string' ? profileData.member_id : null,
      }
    : null

  return { user, profile }
}

export const getAuthProfile = cache(loadAuthProfile)
