'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createBooking, type CreateBookingFormState } from '../actions/create-booking'
import { formatDateTime } from '@/shared/lib/format-date'
import { SingleSelect } from '@/shared/ui/single-select'

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

const initialState = { message: '', errors: {} }

type CreateBookingFormAction = (
  prevValue: CreateBookingFormState,
  formData: FormData,
) => Promise<CreateBookingFormState>

type CreateBookingFormProps = {
  sessions: SessionOption[]
  members: MemberOption[]
  action?: CreateBookingFormAction
}

export default function CreateBookingForm({
  sessions,
  members,
  action = createBooking,
}: CreateBookingFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [sessionId, setSessionId] = useState('')
  const [memberId, setMemberId] = useState('')

  const sessionIdError = state?.errors?.sessionId?.[0]
  const memberIdError = state?.errors?.memberId?.[0]
  const sessionOptions = [
    { value: '', label: 'Select a session' },
    ...sessions.map(session => ({
      value: session.id,
      label: `${session.title} — ${formatDateTime(session.starts_at)}${
        session.trainer ? ` — ${session.trainer.full_name}` : ''
      }`,
    })),
  ]
  const memberOptions = [
    { value: '', label: 'Select a member' },
    ...members.map(member => ({
      value: member.id,
      label: `${member.full_name} — ${member.email}`,
    })),
  ]

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
        <div className='min-w-0'>
          <SingleSelect
            label='Session'
            name='sessionId'
            options={sessionOptions}
            value={sessionId}
            onChange={setSessionId}
            aria-invalid={Boolean(sessionIdError)}
            aria-describedby={sessionIdError ? 'session-error' : undefined}
          />
          {sessionIdError && (
            <p id='session-error' className='mt-2 text-sm text-[var(--danger)]'>
              {sessionIdError}
            </p>
          )}
        </div>

        <div className='min-w-0'>
          <SingleSelect
            label='Member'
            name='memberId'
            options={memberOptions}
            value={memberId}
            onChange={setMemberId}
            aria-invalid={Boolean(memberIdError)}
            aria-describedby={memberIdError ? 'member-error' : undefined}
          />
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
