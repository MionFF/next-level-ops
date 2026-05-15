'use client'

import { useActionState } from 'react'
import { cancelBooking, type CancelBookingFormState } from '../actions/cancel-booking'

type CancelBookingButtonProps = {
  bookingId: string
}

const initialState: CancelBookingFormState = { message: undefined }

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [state, formAction, isPending] = useActionState(cancelBooking, initialState)

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
