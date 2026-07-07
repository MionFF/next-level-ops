'use client'

import { useActionState } from 'react'
import {
  cancelMemberMembership,
  type CancelMemberMembershipFormState,
} from '../actions/cancel-member-membership'

const initialState: CancelMemberMembershipFormState = {
  message: '',
  errors: {},
}

type CancelMemberMembershipAction = (
  prevValue: CancelMemberMembershipFormState,
  formData: FormData,
) => Promise<CancelMemberMembershipFormState>

type CancelMemberMembershipButtonProps = {
  memberId: string
  membershipId: string
  action?: CancelMemberMembershipAction
}

export function CancelMemberMembershipButton({
  memberId,
  membershipId,
  action = cancelMemberMembership,
}: CancelMemberMembershipButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction} className='space-y-2'>
      <input type='hidden' name='memberId' value={memberId} />
      <input type='hidden' name='membershipId' value={membershipId} />

      <button
        type='submit'
        disabled={isPending}
        className='w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--danger)]/40 px-3 py-2 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:text-[var(--muted)] sm:w-auto'
      >
        {isPending ? 'Cancelling...' : 'Cancel'}
      </button>

      {state.message && (
        <p role='status' className='text-sm text-[var(--danger)]'>
          {state.message}
        </p>
      )}
    </form>
  )
}
