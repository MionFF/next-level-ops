import { AdminShell } from '@/widgets/app-shell/admin-dashboard-shell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell pageTitle='Dashboard' roleLabel='Admin'>
      {children}
    </AdminShell>
  )
}
