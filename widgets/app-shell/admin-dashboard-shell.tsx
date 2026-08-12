import SignOutButton from '@/features/auth/sign-out/ui/sign-out-button'
import { navigationItems } from '@/shared/config/adminNavigation'
import { MobileNav } from '@/shared/ui/mobile-nav'
import { NavLink } from '@/shared/ui/nav-link'

type AdminShellProps = {
  children: React.ReactNode
  pageTitle: string
}

export function AdminShell({ children, pageTitle }: AdminShellProps) {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--foreground)]'>
      <MobileNav brandLabel='Next Level Ops' navItems={navigationItems} />

      <div className='grid lg:min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='sticky top-0 hidden max-h-screen overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-5 py-6 lg:block'>
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]'>
              Next Level Ops
            </p>
          </div>

          <nav aria-label='Sidebar'>
            <ul className='space-y-2'>
              {navigationItems.map(item => (
                <li key={item.href}>
                  <NavLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className='min-w-0 flex flex-col lg:min-h-screen'>
          <header className='sticky top-0 z-40 hidden border-b border-[var(--border)] bg-[var(--surface)] px-8 py-4 lg:block'>
            <div className='flex items-center justify-between gap-4'>
              <h1 className='text-2xl font-semibold'>{pageTitle}</h1>

              <SignOutButton />
            </div>
          </header>

          <main className='min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:overflow-x-auto lg:px-8'>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
