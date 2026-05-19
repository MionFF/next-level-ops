import SignOutButton from '@/features/auth/sign-out/ui/sign-out-button'
import { clientNavigationItems } from '@/shared/config/clientNavigation'
import { MobileNav } from '@/shared/ui/mobile-nav'
import { NavLink } from '@/shared/ui/nav-link'

type ClientCabinetShellProps = {
  children: React.ReactNode
  pageTitle: string
  userLabel: string
}

export function ClientCabinetShell({ children, pageTitle, userLabel }: ClientCabinetShellProps) {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--foreground)]'>
      {/* Mobile top bar + overlay — visible only below lg */}
      <MobileNav
        brandLabel='Next Level Ops'
        badgeLabel={userLabel}
        navItems={clientNavigationItems}
      />

      <div className='grid min-h-screen lg:grid-cols-[200px_minmax(0,1fr)]'>
        {/* Desktop sidebar — hidden below lg */}
        <aside className='hidden lg:block sticky top-0 max-h-screen overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6'>
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]'>
              Next Level Ops
            </p>
          </div>

          <nav aria-label='Sidebar'>
            <ul className='space-y-2'>
              {clientNavigationItems.map(item => (
                <li key={item.href}>
                  <NavLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className='flex min-h-screen flex-col'>
          {/* Desktop header — hidden below lg */}
          <header className='hidden lg:block sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-8 py-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-2xl font-semibold'>{pageTitle}</h1>
              </div>

              <div className='flex items-center gap-3'>
                <span className='rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
                  {userLabel}
                </span>
                <SignOutButton />
              </div>
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
