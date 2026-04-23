import { ClientCabinetShell } from "@/widgets/app-shell/client-cabinet-shell"

export default function CabinetLayout(props: LayoutProps<"/cabinet">) {
  return (
    <ClientCabinetShell pageTitle="Overview" userLabel="Member">
      {props.children}
    </ClientCabinetShell>
  )
}
