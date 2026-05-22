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
        className='rounded-[var(--radius-sm)] cursor-pointer border border-[var(--danger)]/40 px-2.5 py-1 text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {isPending ? 'Cancelling...' : 'Cancel'}
      </button>
      {state?.message && <p className='mt-1 text-xs text-[var(--danger)]'>{state.message}</p>}
    </form>
  )
}
