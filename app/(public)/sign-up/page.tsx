import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { getRoleHomePath } from '@/features/auth/model/auth-role'
import SignUpForm from '@/features/auth/sign-up/ui/sign-up-form'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user, profile } = await getAuthProfile()
  const roleHomePath = getRoleHomePath(profile?.role)

  if (!user) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]'>
        <SignUpForm />
      </main>
    )
  }

  if (roleHomePath) return redirect(roleHomePath)

  return redirect('/forbidden')
}
