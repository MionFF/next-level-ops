import { navigationItems } from '@/shared/config/adminNavigation'
import Link from 'next/link'

type AdminShellProps = {
  children: React.ReactNode
  pageTitle: string
  roleLabel: string
}

export function AdminShell({ children, pageTitle, roleLabel }: AdminShellProps) {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--foreground)]'>
      <div className='grid min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='border-b border-[var(--border)] bg-[var(--surface)] px-4 py-6 lg:border-r lg:border-b-0 lg:px-5'>
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]'>
              Next Level Ops
            </p>
          </div>

          <nav aria-label='Sidebar'>
            <ul className='space-y-2'>
              {navigationItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='flex rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className='flex min-h-screen flex-col'>
          <header className='border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 lg:px-8'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-2xl font-semibold'>{pageTitle}</h1>
              </div>

              <div className='flex items-center gap-3'>
                <span className='rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
                  {roleLabel}
                </span>
                <button
                  type='button'
                  className='rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)]'
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <main className='flex-1 px-4 py-6 lg:px-8'>{children}</main>
        </div>
      </div>
    </div>
  )
}
