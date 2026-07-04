'use client'

import { useActionState } from 'react'
import {
  unlinkProfileMember,
  type UnlinkProfileMemberFormState,
} from '../actions/unlink-profile-member'

const initialState: UnlinkProfileMemberFormState = {
  message: '',
  errors: {},
}

type UnlinkProfileMemberAction = (
  prevValue: UnlinkProfileMemberFormState,
  formData: FormData,
) => Promise<UnlinkProfileMemberFormState>

type UnlinkProfileMemberButtonProps = {
  profileId: string
  action?: UnlinkProfileMemberAction
}

export default function UnlinkProfileMemberButton({
  profileId,
  action = unlinkProfileMember,
}: UnlinkProfileMemberButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction} className='inline-flex flex-col items-end gap-2'>
      <input type='hidden' name='profileId' value={profileId} />

      <button
        type='submit'
        disabled={isPending}
        className='rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--danger)]/60 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:text-[var(--muted)] cursor-pointer'
      >
        {isPending ? 'Unlinking...' : 'Unlink'}
      </button>

      {state.message && (
        <span role='status' className='max-w-48 text-right text-xs text-[var(--danger)]'>
          {state.message}
        </span>
      )}
    </form>
  )
}
