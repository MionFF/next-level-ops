import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { getRoleHomePath } from '@/features/auth/model/auth-role'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user, profile } = await getAuthProfile()
  const roleHomePath = getRoleHomePath(profile?.role)

  if (!user) return redirect('/sign-in')

  if (roleHomePath) return redirect(roleHomePath)
  redirect('/forbidden')
}
