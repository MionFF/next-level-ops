import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { AdminShell } from '@/widgets/app-shell/admin-dashboard-shell'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getAuthProfile()

  if (!user) return redirect('/sign-in')
  if (profile?.role !== 'admin') return redirect('/forbidden')

  return (
    <AdminShell pageTitle='Dashboard' roleLabel='Admin'>
      {children}
    </AdminShell>
  )
}
