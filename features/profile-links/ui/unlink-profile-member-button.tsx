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
        className='cursor-pointer rounded-[var(--radius-sm)] border border-[var(--danger)]/30 bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--danger)] outline-none transition-colors enabled:hover:border-[var(--danger)]/55 enabled:hover:bg-[var(--danger)]/10 focus-visible:ring-2 focus-visible:ring-[var(--danger)]/30 disabled:cursor-not-allowed disabled:border-[var(--border)]! disabled:bg-[var(--surface-2)]! disabled:text-[var(--muted)]! disabled:opacity-60'
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
