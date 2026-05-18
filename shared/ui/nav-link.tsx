'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLinkProps = {
  href: string
  label: string
  /** Routes considered "root" get exact match; all others use prefix match for nesting. */
  rootRoutes?: string[]
}

const DEFAULT_ROOT_ROUTES = ['/dashboard', '/cabinet']

function isActive(pathname: string, href: string, rootRoutes: string[]): boolean {
  if (rootRoutes.includes(href)) {
    return pathname === href
  }
  return pathname.startsWith(href)
}

export function NavLink({ href, label, rootRoutes = DEFAULT_ROOT_ROUTES }: NavLinkProps) {
  const pathname = usePathname()
  const active = isActive(pathname, href, rootRoutes)

  return (
    <Link
      href={href}
      className={`flex rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}
