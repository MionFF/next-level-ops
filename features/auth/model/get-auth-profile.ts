import { createClient } from '@/lib/supabase/server'
import { isAuthRole, type AuthRole } from './auth-role'

type AuthProfile = {
  role: AuthRole | null
}

export async function getAuthProfile() {
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
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const profile: AuthProfile | null = profileData
    ? {
        role: isAuthRole(profileData.role) ? profileData.role : null,
      }
    : null

  return { user, profile }
}
