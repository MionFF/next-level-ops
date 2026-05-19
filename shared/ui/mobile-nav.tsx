'use client'

import { useState, useEffect } from 'react'
import { NavLink } from '@/shared/ui/nav-link'
import SignOutButton from '@/features/auth/sign-out/ui/sign-out-button'

type NavItem = { href: string; label: string }

type MobileNavProps = {
  brandLabel: string
  badgeLabel: string
  navItems: NavItem[]
  /** Routes considered "root" get exact match; all others use prefix match for nesting. */
  rootRoutes?: string[]
}

/**
 * Three-bar hamburger that smoothly transforms into an X.
 * Each bar is a 20px-wide, 2px-tall rounded rect. Bars 1 and 3 rotate to form the X;
 * bar 2 fades out. All transitions run at the same duration for a clean morph.
 */
function HamburgerToggle({ open }: { open: boolean }) {
  const barBase =
    'absolute left-0 h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-in-out'

  return (
    <span className='relative inline-flex h-5 w-5 shrink-0' aria-hidden='true'>
      {/* top bar */}
      <span
        className={barBase}
        style={{
          top: '3px',
          transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
        }}
      />
      {/* middle bar */}
      <span
        className={barBase}
        style={{
          top: '9px',
          opacity: open ? 0 : 1,
        }}
      />
      {/* bottom bar */}
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

export function MobileNav({ brandLabel, badgeLabel, navItems, rootRoutes }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const label = open ? 'Close navigation menu' : 'Open navigation menu'

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleClose() {
    setOpen(false)
  }

  return (
    <>
      {/* Mobile top bar — sticky, only visible below lg */}
      <div className='lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3'>
        <span className='text-sm font-semibold uppercase tracking-[0.15em] text-[var(--muted)]'>
          {brandLabel}
        </span>
        <button
          type='button'
          onClick={() => setOpen(prev => !prev)}
          className='inline-flex items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--foreground)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30'
          aria-label={label}
          aria-expanded={open}
        >
          <HamburgerToggle open={open} />
        </button>
      </div>

      {/* Full-screen overlay — always rendered so animates; visibility toggled via opacity + pointer-events */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-[var(--background)] transition-opacity duration-200 ease-in-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        {/* Header row: brand + close */}
        <div className='flex items-center justify-between border-b border-[var(--border)] px-4 py-3'>
          <span className='text-sm font-semibold uppercase tracking-[0.15em] text-[var(--muted)]'>
            {brandLabel}
          </span>
          <button
            type='button'
            onClick={handleClose}
            className='inline-flex items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--foreground)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30'
            aria-label='Close navigation menu'
          >
            <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='h-5 w-5'>
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

        {/* Body: nav + badge + sign out */}
        <div className='flex flex-col gap-6 px-4 py-6'>
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

          <div className='border-t border-[var(--border)] pt-6'>
            <div className='flex items-center justify-between'>
              <span className='rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
                {badgeLabel}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
