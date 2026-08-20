'use client'

import { useEffect, useState } from 'react'
import SignOutButton from '@/features/auth/sign-out/ui/sign-out-button'
import { NavLink } from '@/shared/ui/nav-link'

type NavItem = {
  href: string
  label: string
}

type MobileNavProps = {
  brandLabel: string
  navItems: NavItem[]
  rootRoutes?: string[]
}

function HamburgerToggle({ open }: { open: boolean }) {
  const barBase =
    'absolute left-0 h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-in-out'

  return (
    <span className='relative inline-flex h-5 w-5 shrink-0' aria-hidden='true'>
      <span
        className={barBase}
        style={{
          top: '3px',
          transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
        }}
      />

      <span
        className={barBase}
        style={{
          top: '9px',
          opacity: open ? 0 : 1,
        }}
      />

      <span
        className={barBase}
        style={{
          top: '15px',
          transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
        }}
      />
    </span>
  )
}

export function MobileNav({ brandLabel, navItems, rootRoutes }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const label = open ? 'Close navigation menu' : 'Open navigation menu'

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleClose() {
    setOpen(false)
  }

  return (
    <>
      <div className='sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden'>
        <span className='text-sm font-semibold uppercase tracking-[0.15em] text-[var(--muted)]'>
          {brandLabel}
        </span>

        <button
          type='button'
          onClick={() => setOpen(current => !current)}
          className='inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30'
          aria-label={label}
          aria-expanded={open}
          aria-controls='mobile-navigation-drawer'
        >
          <HamburgerToggle open={open} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <button
          type='button'
          tabIndex={open ? 0 : -1}
          aria-label='Close navigation menu'
          onClick={handleClose}
          className={`absolute inset-0 cursor-default bg-black/55 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id='mobile-navigation-drawer'
          className={`absolute inset-y-0 right-0 flex w-[calc(100%-1.5rem)] max-w-sm flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className='flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4'>
            <span className='text-sm font-semibold uppercase tracking-[0.15em] text-[var(--muted)]'>
              {brandLabel}
            </span>

            <button
              type='button'
              onClick={handleClose}
              className='inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30'
              aria-label='Close navigation menu'
            >
              <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='size-5'>
                <path
                  d='M5.75 5.75l8.5 8.5m0-8.5-8.5 8.5'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>

          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6'>
            <nav aria-label='Mobile navigation'>
              <ul className='space-y-2'>
                {navItems.map(item => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      rootRoutes={rootRoutes}
                      onNavigate={handleClose}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <div className='mt-auto border-t border-[var(--border)] pt-6'>
              <div className='flex justify-end'>
                <SignOutButton />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
