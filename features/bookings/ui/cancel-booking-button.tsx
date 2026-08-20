'use client'

import { useActionState } from 'react'
import { cancelBooking, type CancelBookingFormState } from '../actions/cancel-booking'

type CancelBookingButtonAction = (
  prevValue: CancelBookingFormState,
  formData: FormData,
) => Promise<CancelBookingFormState>

type CancelBookingButtonProps = {
  bookingId: string
  action?: CancelBookingButtonAction
}

const initialState: CancelBookingFormState = { message: undefined }

export default function CancelBookingButton({
  bookingId,
  action = cancelBooking,
}: CancelBookingButtonProps) {
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
