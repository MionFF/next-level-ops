'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createTrainer, type CreateTrainerFormState } from '../actions/create-trainer'
import { trainerStatusOptions, type TrainerStatus } from '../model/trainer'
import { SingleSelect } from '@/shared/ui/single-select'

const initialState = { message: '', errors: {} }

type CreateTrainerFormAction = (
  prevValue: CreateTrainerFormState,
  formData: FormData,
) => Promise<CreateTrainerFormState>

type CreateTrainerFormProps = {
  action?: CreateTrainerFormAction
}

export default function CreateTrainerForm({ action = createTrainer }: CreateTrainerFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [status, setStatus] = useState<TrainerStatus>('active')

  const fullNameError = state?.errors?.fullName?.[0]
  const emailError = state?.errors?.email?.[0]
  const phoneError = state?.errors?.phone?.[0]
  const specialtyError = state?.errors?.specialty?.[0]
  const statusError = state?.errors?.status?.[0]

  return (
    <form
      action={formAction}
      noValidate
      className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'
    >
      <div className='mb-6'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Trainers
        </p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>Add trainer</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Create a trainer record without linking a profile or membership.
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
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
            placeholder='Alex Morgan'
            value={fullName}
            onChange={event => setFullName(event.target.value)}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? 'full-name-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
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
            placeholder='alex@example.com'
            value={email}
            onChange={event => setEmail(event.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {emailError && (
            <p id='email-error' className='mt-2 text-sm text-[var(--danger)]'>
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='phone-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Phone
          </label>
          <input
            type='tel'
            name='phone'
            id='phone-input'
            autoComplete='tel'
            placeholder='+1 555 0101'
            value={phone}
            onChange={event => setPhone(event.target.value)}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'phone-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {phoneError && (
            <p id='phone-error' className='mt-2 text-sm text-[var(--danger)]'>
              {phoneError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='specialty-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Specialty
          </label>
          <input
            type='text'
            name='specialty'
            id='specialty-input'
            placeholder='e.g. Yoga, HIIT, Strength'
            value={specialty}
            onChange={event => setSpecialty(event.target.value)}
            aria-invalid={Boolean(specialtyError)}
            aria-describedby={specialtyError ? 'specialty-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground)]/70 enabled:hover:bg-[var(--control-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {specialtyError && (
            <p id='specialty-error' className='mt-2 text-sm text-[var(--danger)]'>
              {specialtyError}
            </p>
          )}
        </div>

        <div>
          <SingleSelect
            label='Status'
            name='status'
            options={trainerStatusOptions}
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
          href='/dashboard/trainers'
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
        >
          {isPending ? 'Creating trainer...' : 'Create trainer'}
        </button>
      </div>
    </form>
  )
}
