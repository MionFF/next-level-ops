'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signUp, type SignUpFormState } from '@/features/auth/sign-up/actions/signUp'

const initialState = { message: '', errors: {} }

type SignUpFormAction = (prevValue: SignUpFormState, formData: FormData) => Promise<SignUpFormState>

type SignUpFormProps = {
  action?: SignUpFormAction
}

export default function SignUpForm({ action = signUp }: SignUpFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const fullNameError = state?.errors?.fullName?.[0]
  const emailError = state?.errors?.email?.[0]
  const passwordError = state?.errors?.password?.[0]
  const confirmPasswordError = state?.errors?.confirmPassword?.[0]

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFullName(e.target.value)
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
  }

  return (
    <form
      action={formAction}
      noValidate
      className='w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-black/20 sm:p-8'
    >
      <div className='mb-8'>
        <p className='mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]'>
          Next Level Ops
        </p>
        <h1 className='text-2xl font-semibold tracking-tight text-[var(--foreground)]'>
          Create your account
        </h1>
        <p className='mt-2 text-sm leading-6 text-[var(--muted)]'>
          Start managing bookings, members, and studio operations.
        </p>
      </div>

      <div className='space-y-5'>
        <div>
          <label
            htmlFor='full-name-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Full name
          </label>
          <input
            type='text'
            name='fullName'
            id='full-name-input'
            autoComplete='name'
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? 'full-name-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
            value={fullName}
            onChange={handleNameChange}
          />
          {fullNameError && (
            <p id='full-name-error' className='mt-2 text-sm text-[var(--danger)]'>
              {fullNameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='email-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Email
          </label>
          <input
            type='email'
            name='email'
            id='email-input'
            autoComplete='email'
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
            value={email}
            onChange={handleEmailChange}
          />
          {emailError && (
            <p id='email-error' className='mt-2 text-sm text-[var(--danger)]'>
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='password-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Password
          </label>
          <input
            type='password'
            name='password'
            id='password-input'
            autoComplete='new-password'
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? 'password-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && (
            <p id='password-error' className='mt-2 text-sm text-[var(--danger)]'>
              {passwordError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='confirm-password-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Confirm password
          </label>
          <input
            type='password'
            name='confirmPassword'
            id='confirm-password-input'
            autoComplete='new-password'
            aria-invalid={Boolean(confirmPasswordError)}
            aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {confirmPasswordError && (
            <p id='confirm-password-error' className='mt-2 text-sm text-[var(--danger)]'>
              {confirmPasswordError}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <p
          role='status'
          className='mt-5 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]'
        >
          {state.message}
        </p>
      )}

      <button
        type='submit'
        disabled={isPending}
        className='mt-6 w-full rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
      >
        {isPending ? 'Creating account...' : 'Sign up'}
      </button>

      <p className='mt-6 text-center text-sm text-[var(--muted)]'>
        Already have an account?{' '}
        <Link
          href={'/sign-in'}
          className='font-medium text-[var(--primary)] underline-offset-4 transition-colors hover:text-[var(--primary-foreground)] hover:underline'
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
