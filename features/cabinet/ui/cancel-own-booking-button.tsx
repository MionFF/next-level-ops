'use client'

import { useActionState } from 'react'
import { cancelOwnBooking, type CancelOwnBookingFormState } from '../actions/cancel-own-booking'

type CancelOwnBookingButtonAction = (
  prevValue: CancelOwnBookingFormState,
  formData: FormData,
) => Promise<CancelOwnBookingFormState>

type CancelOwnBookingButtonProps = {
  bookingId: string
  action?: CancelOwnBookingButtonAction
}

const initialState: CancelOwnBookingFormState = { message: undefined }

export function CancelOwnBookingButton({
  bookingId,
  action = cancelOwnBooking,
}: CancelOwnBookingButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction}>
      <input type='hidden' name='bookingId' value={bookingId} />
      <button
        type='submit'
        disabled={isPending}
        className='cursor-pointer rounded-[var(--radius-sm)] border border-[var(--danger)]/30 bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--danger)] outline-none transition-colors enabled:hover:border-[var(--danger)]/55 enabled:hover:bg-[var(--danger)]/10 focus-visible:ring-2 focus-visible:ring-[var(--danger)]/30 disabled:cursor-not-allowed disabled:border-[var(--border)]! disabled:bg-[var(--surface-2)]! disabled:text-[var(--muted)]! disabled:opacity-60'
      >
        {isPending ? 'Cancelling...' : 'Cancel'}
      </button>
      {state?.message && <p className='mt-1 text-xs text-[var(--danger)]'>{state.message}</p>}
    </form>
  )
}
