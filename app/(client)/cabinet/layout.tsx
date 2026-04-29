import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { ClientCabinetShell } from '@/widgets/app-shell/client-cabinet-shell'
import { redirect } from 'next/navigation'

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getAuthProfile()

  if (!user) return redirect('/sign-in')
  if (profile?.role !== 'client') return redirect('/forbidden')

  return (
    <ClientCabinetShell pageTitle='Overview' userLabel='Member'>
      {children}
    </ClientCabinetShell>
  )
}
