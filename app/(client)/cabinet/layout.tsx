import { ClientCabinetShell } from '@/widgets/app-shell/client-cabinet-shell'

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientCabinetShell pageTitle='Overview' userLabel='Member'>
      {children}
    </ClientCabinetShell>
  )
}
