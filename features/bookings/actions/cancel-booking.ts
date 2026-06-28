'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { canCancelBooking, type CancellableBooking } from '../model/booking'

export type CancelBookingFormState = {
  message?: string
}

export async function cancelBooking(
  _prevValue: CancelBookingFormState,
  formData: FormData,
): Promise<CancelBookingFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const bookingId = formData.get('bookingId')?.toString()

  if (!bookingId) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  const supabase = await createClient()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, status, session:sessions(id, title, starts_at, ends_at)')
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingError) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  if (!booking) {
    return { message: 'Booking was not found or already cancelled.' }
  }

  const session = Array.isArray(booking.session) ? (booking.session[0] ?? null) : booking.session

  const cancellableBooking: CancellableBooking = {
    status: booking.status,
    session: session
      ? {
          starts_at: session.starts_at,
        }
      : null,
  }

  if (!canCancelBooking(cancellableBooking)) {
    return { message: 'Only future confirmed bookings can be cancelled.' }
  }

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', 'confirmed')
    .select('id')
    .maybeSingle()

  if (updateError) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  if (!updatedBooking) {
    return { message: 'Booking was not found or already cancelled.' }
  }

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard/sessions')

  return { message: undefined }
}
