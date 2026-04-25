import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { getRoleHomePath } from '@/features/auth/model/auth-role'
import SignInForm from '@/features/auth/sign-in/ui/sign-in-form'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user, profile } = await getAuthProfile()
  const roleHomePath = getRoleHomePath(profile?.role)

  if (!user) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]'>
        <SignInForm />
      </main>
    )
  }

  if (roleHomePath) return redirect(roleHomePath)

  return redirect('/forbidden')
}
