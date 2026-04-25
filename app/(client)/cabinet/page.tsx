import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user, profile } = await getAuthProfile()

  if (!user) return redirect('/sign-in')
  if (profile?.role !== 'client') return redirect('/forbidden')

  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <p className='text-sm text-[var(--muted)]'>Client cabinet content goes here.</p>
    </section>
  )
}
