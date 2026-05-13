'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { updateMembershipPlan } from '../actions/update-membership-plan'
import type { EditableMembershipPlan, MembershipPlanStatus } from '../model/membership-plan'
import { isMembershipPlanStatus, membershipPlanStatuses } from '../model/membership-plan'

const initialState = { message: '', errors: {} }

export default function EditMembershipPlanForm({ plan }: { plan: EditableMembershipPlan }) {
  const updatePlanAction = updateMembershipPlan.bind(null, plan.id)
  const [state, formAction, isPending] = useActionState(updatePlanAction, initialState)
  const [name, setName] = useState(plan.name)
  const [description, setDescription] = useState(plan.description ?? '')
  const [durationDays, setDurationDays] = useState(String(plan.duration_days))
  const [priceCents, setPriceCents] = useState(String(plan.price_cents))
  const [status, setStatus] = useState<MembershipPlanStatus>(plan.status)

  const nameError = state?.errors?.name?.[0]
  const descriptionError = state?.errors?.description?.[0]
  const durationDaysError = state?.errors?.durationDays?.[0]
  const priceCentsError = state?.errors?.priceCents?.[0]
  const statusError = state?.errors?.status?.[0]

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value

    if (isMembershipPlanStatus(nextStatus)) {
      setStatus(nextStatus)
    }
  }

  return (
    <form
      action={formAction}
      noValidate
      className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'
    >
      <div className='mb-6'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Membership plans
        </p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>Edit plan</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Update the membership plan details and current status.
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='name-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Name
          </label>
          <input
            type='text'
            name='name'
            id='name-input'
            autoComplete='off'
            placeholder='e.g. Monthly, Annual'
            value={name}
            onChange={event => setName(event.target.value)}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'name-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {nameError && (
            <p id='name-error' className='mt-2 text-sm text-[var(--danger)]'>
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='description-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Description
          </label>
          <input
            type='text'
            name='description'
            id='description-input'
            autoComplete='off'
            placeholder='e.g. Full access to all classes'
            value={description}
            onChange={event => setDescription(event.target.value)}
            aria-invalid={Boolean(descriptionError)}
            aria-describedby={descriptionError ? 'description-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {descriptionError && (
            <p id='description-error' className='mt-2 text-sm text-[var(--danger)]'>
              {descriptionError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='duration-days-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Duration (days)
          </label>
          <input
            type='number'
            name='durationDays'
            id='duration-days-input'
            autoComplete='off'
            placeholder='e.g. 30'
            value={durationDays}
            onChange={event => setDurationDays(event.target.value)}
            aria-invalid={Boolean(durationDaysError)}
            aria-describedby={durationDaysError ? 'duration-days-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {durationDaysError && (
            <p id='duration-days-error' className='mt-2 text-sm text-[var(--danger)]'>
              {durationDaysError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='price-cents-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Price (cents)
          </label>
          <input
            type='number'
            name='priceCents'
            id='price-cents-input'
            autoComplete='off'
            placeholder='e.g. 9900'
            value={priceCents}
            onChange={event => setPriceCents(event.target.value)}
            aria-invalid={Boolean(priceCentsError)}
            aria-describedby={priceCentsError ? 'price-cents-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          <p className='mt-1 text-xs text-[var(--muted)]'>
            Enter amount in cents (e.g. 9900 = $99.00)
          </p>
          {priceCentsError && (
            <p id='price-cents-error' className='mt-2 text-sm text-[var(--danger)]'>
              {priceCentsError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='status-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Status
          </label>
          <select
            name='status'
            id='status-input'
            value={status}
            onChange={handleStatusChange}
            aria-invalid={Boolean(statusError)}
            aria-describedby={statusError ? 'status-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm capitalize text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          >
            {membershipPlanStatuses.map(planStatus => (
              <option key={planStatus} value={planStatus}>
                {planStatus}
              </option>
            ))}
          </select>
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
          href='/dashboard/plans'
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
        >
          {isPending ? 'Saving plan...' : 'Save plan'}
        </button>
      </div>
    </form>
  )
}
