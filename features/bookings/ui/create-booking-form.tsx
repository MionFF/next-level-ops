'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createBooking } from '../actions/create-booking'
import { formatDateTime } from '@/shared/lib/format-date'

type SessionOption = {
  id: string
  title: string
  starts_at: string
  trainer: { full_name: string } | null
}

type MemberOption = {
  id: string
  full_name: string
  email: string
}

type CreateBookingFormProps = {
  sessions: SessionOption[]
  members: MemberOption[]
}

const initialState = { message: '', errors: {} }

export default function CreateBookingForm({ sessions, members }: CreateBookingFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState)
  const [sessionId, setSessionId] = useState('')
  const [memberId, setMemberId] = useState('')

  const sessionIdError = state?.errors?.sessionId?.[0]
  const memberIdError = state?.errors?.memberId?.[0]

  return (
    <form
      action={formAction}
      noValidate
      className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'
    >
      <div className='mb-6'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Bookings
        </p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>Add booking</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Create a booking for a member and session.
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='session-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Session
          </label>
          <select
            name='sessionId'
            id='session-input'
            value={sessionId}
            onChange={event => setSessionId(event.target.value)}
            aria-invalid={Boolean(sessionIdError)}
            aria-describedby={sessionIdError ? 'session-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          >
            <option value=''>Select a session</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.title} — {formatDateTime(session.starts_at)}
                {session.trainer ? ` — ${session.trainer.full_name}` : ''}
              </option>
            ))}
          </select>
          {sessionIdError && (
            <p id='session-error' className='mt-2 text-sm text-[var(--danger)]'>
              {sessionIdError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='member-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Member
          </label>
          <select
            name='memberId'
            id='member-input'
            value={memberId}
            onChange={event => setMemberId(event.target.value)}
            aria-invalid={Boolean(memberIdError)}
            aria-describedby={memberIdError ? 'member-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          >
            <option value=''>Select a member</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.full_name} — {member.email}
              </option>
            ))}
          </select>
          {memberIdError && (
            <p id='member-error' className='mt-2 text-sm text-[var(--danger)]'>
              {memberIdError}
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

      <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <Link
          href='/dashboard/bookings'
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
        >
          {isPending ? 'Creating booking...' : 'Create booking'}
        </button>
      </div>
    </form>
  )
}
