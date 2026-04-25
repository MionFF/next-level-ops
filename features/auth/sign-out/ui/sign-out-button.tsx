'use client'

import { signOut } from '../actions/signOut'
import { useFormStatus } from 'react-dom'

function SignOutSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-2)] hover:text-[var(--primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface)] disabled:text-[var(--muted)] cursor-pointer'
      aria-busy={pending}
    >
      <svg aria-hidden='true' viewBox='0 0 20 20' fill='none' className='h-4 w-4 shrink-0'>
        <path
          d='M7.5 6V4.75A1.75 1.75 0 0 1 9.25 3h4.5A1.75 1.75 0 0 1 15.5 4.75v10.5A1.75 1.75 0 0 1 13.75 17h-4.5A1.75 1.75 0 0 1 7.5 15.25V14'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.25 10H3.5m0 0 2.25-2.25M3.5 10l2.25 2.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
      <span>{pending ? 'Signing out...' : 'Sign out'}</span>
    </button>
  )
}

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <SignOutSubmitButton />
    </form>
  )
}
