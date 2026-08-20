'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createSession, type CreateSessionFormState } from '../actions/create-session'
import { sessionStatusOptions, type SessionStatus } from '../model/session'
import { SingleSelect } from '@/shared/ui/single-select'

type TrainerOption = {
  id: string
  full_name: string
}

const initialState = { message: '', errors: {} }

type CreateSessionFormAction = (
  prevValue: CreateSessionFormState,
  formData: FormData,
) => Promise<CreateSessionFormState>

type CreateSessionFormProps = {
  trainers: TrainerOption[]
  action?: CreateSessionFormAction
}

export default function CreateSessionForm({
  trainers,
  action = createSession,
}: CreateSessionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [title, setTitle] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [status, setStatus] = useState<SessionStatus>('scheduled')

  const titleError = state?.errors?.title?.[0]
  const trainerIdError = state?.errors?.trainerId?.[0]
  const startsAtError = state?.errors?.startsAt?.[0]
  const endsAtError = state?.errors?.endsAt?.[0]
  const capacityError = state?.errors?.capacity?.[0]
  const statusError = state?.errors?.status?.[0]

  const trainerOptions = [
    { value: '', label: 'Select a trainer' },
    ...trainers.map(trainer => ({
      value: trainer.id,
      label: trainer.full_name,
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
          Sessions
        </p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>Add session</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Schedule a new studio session with a trainer and capacity limit.
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='title-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Title
          </label>
          <input
            type='text'
            name='title'
            id='title-input'
            placeholder='Morning Yoga Flow'
            value={title}
            onChange={event => setTitle(event.target.value)}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'title-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {titleError && (
            <p id='title-error' className='mt-2 text-sm text-[var(--danger)]'>
              {titleError}
            </p>
          )}
        </div>

        <div className='min-w-0'>
          <SingleSelect
            label='Trainer'
            name='trainerId'
            options={trainerOptions}
            value={trainerId}
            onChange={setTrainerId}
            aria-invalid={Boolean(trainerIdError)}
            aria-describedby={trainerIdError ? 'trainer-id-error' : undefined}
          />
          {trainerIdError && (
            <p id='trainer-id-error' className='mt-2 text-sm text-[var(--danger)]'>
              {trainerIdError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='starts-at-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Starts at
          </label>
          <input
            type='datetime-local'
            name='startsAt'
            id='starts-at-input'
            value={startsAt}
            onChange={event => setStartsAt(event.target.value)}
            aria-invalid={Boolean(startsAtError)}
            aria-describedby={startsAtError ? 'starts-at-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {startsAtError && (
            <p id='starts-at-error' className='mt-2 text-sm text-[var(--danger)]'>
              {startsAtError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='ends-at-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Ends at
          </label>
          <input
            type='datetime-local'
            name='endsAt'
            id='ends-at-input'
            value={endsAt}
            onChange={event => setEndsAt(event.target.value)}
            aria-invalid={Boolean(endsAtError)}
            aria-describedby={endsAtError ? 'ends-at-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {endsAtError && (
            <p id='ends-at-error' className='mt-2 text-sm text-[var(--danger)]'>
              {endsAtError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='capacity-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Capacity
          </label>
          <input
            type='number'
            name='capacity'
            id='capacity-input'
            placeholder='20'
            value={capacity}
            onChange={event => setCapacity(event.target.value)}
            aria-invalid={Boolean(capacityError)}
            aria-describedby={capacityError ? 'capacity-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {capacityError && (
            <p id='capacity-error' className='mt-2 text-sm text-[var(--danger)]'>
              {capacityError}
            </p>
          )}
        </div>

        <div>
          <SingleSelect
            label='Status'
            name='status'
            options={sessionStatusOptions}
            value={status}
            onChange={setStatus}
            aria-invalid={Boolean(statusError)}
            aria-describedby={statusError ? 'status-error' : undefined}
          />
          {statusError && (
            <p id='status-error' className='mt-2 text-sm text-[var(--danger)]'>
              {statusError}
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
          href='/dashboard/sessions'
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
        >
          {isPending ? 'Creating session...' : 'Create session'}
        </button>
      </div>
    </form>
  )
}
