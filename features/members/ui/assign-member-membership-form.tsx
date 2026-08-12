'use client'

import { useActionState, useState } from 'react'
import {
  assignMemberMembership,
  type AssignMemberMembershipFormState,
} from '../actions/assign-member-membership'
import type { MemberMembershipPlanOption } from '../model/member-membership'
import { SingleSelect } from '@/shared/ui/single-select'

const initialState: AssignMemberMembershipFormState = {
  message: '',
  errors: {},
}

type AssignMemberMembershipAction = (
  prevValue: AssignMemberMembershipFormState,
  formData: FormData,
) => Promise<AssignMemberMembershipFormState>

type AssignMemberMembershipFormProps = {
  memberId: string
  plans: MemberMembershipPlanOption[]
  defaultStartDate: string
  minStartDate: string
  isRenewal: boolean
  action?: AssignMemberMembershipAction
}

export function AssignMemberMembershipForm({
  memberId,
  plans,
  defaultStartDate,
  minStartDate,
  isRenewal,
  action = assignMemberMembership,
}: AssignMemberMembershipFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [planId, setPlanId] = useState('')

  const isDisabled = plans.length === 0 || isPending
  const planError = state.errors?.planId?.[0]
  const startsAtError = state.errors?.startsAt?.[0]

  const title = isRenewal ? 'Renew membership' : 'Assign membership'
  const description = isRenewal
    ? 'Select an active plan for the next membership period. The start date defaults to the current membership end date.'
    : 'Select an active plan and start date. The end date is calculated from the plan duration.'
  const buttonLabel = isRenewal ? 'Renew membership' : 'Assign membership'
  const pendingLabel = isRenewal ? 'Renewing...' : 'Assigning...'
  const planOptions = plans.map(plan => ({
    value: plan.id,
    label: `${plan.name} — ${plan.duration_days} days`,
  }))

  return (
    <form
      action={formAction}
      noValidate
      className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-4'
    >
      <input type='hidden' name='memberId' value={memberId} />

      <div className='mb-4'>
        <h3 className='text-base font-semibold text-[var(--foreground)]'>{title}</h3>
        <p className='mt-1 text-sm leading-6 text-[var(--muted)]'>{description}</p>
      </div>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_auto] lg:items-start'>
        <div className='min-w-0'>
          <SingleSelect
            label='Plan'
            name='planId'
            options={planOptions}
            value={planId}
            onChange={setPlanId}
            disabled={isDisabled}
            placeholder='Select plan'
            aria-invalid={Boolean(planError)}
            aria-describedby={planError ? 'membership-plan-error' : undefined}
          />
          {planError && (
            <p id='membership-plan-error' className='mt-2 text-sm text-[var(--danger)]'>
              {planError}
            </p>
          )}
        </div>

        <div className='min-w-0'>
          <label
            htmlFor='membership-starts-at'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Start date
          </label>
          <input
            id='membership-starts-at'
            name='startsAt'
            type='date'
            defaultValue={defaultStartDate}
            min={minStartDate}
            disabled={isDisabled}
            aria-invalid={Boolean(startsAtError)}
            aria-describedby={startsAtError ? 'membership-starts-at-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:text-[var(--muted)]'
          />
          {startsAtError && (
            <p id='membership-starts-at-error' className='mt-2 text-sm text-[var(--danger)]'>
              {startsAtError}
            </p>
          )}
        </div>

        <div className='lg:pt-7'>
          <button
            type='submit'
            disabled={isDisabled}
            className='w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface)] disabled:text-[var(--muted)] lg:w-auto'
          >
            {isPending ? pendingLabel : buttonLabel}
          </button>
        </div>
      </div>

      {state.message && (
        <p
          role='status'
          className='mt-4 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]'
        >
          {state.message}
        </p>
      )}

      {plans.length === 0 && (
        <p className='mt-4 text-sm text-[var(--muted)]'>No active membership plans available.</p>
      )}
    </form>
  )
}
