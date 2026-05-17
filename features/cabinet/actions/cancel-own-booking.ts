'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type CancelOwnBookingFormState = {
  message?: string
}

export async function cancelOwnBooking(
  _prevState: CancelOwnBookingFormState,
  formData: FormData,
): Promise<CancelOwnBookingFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'client') {
    redirect('/forbidden')
  }

  const bookingId = formData.get('bookingId')?.toString()

  if (!bookingId) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  const supabase = await createClient()

  const { data: cancelled, error } = await supabase.rpc('cancel_own_booking', {
    p_booking_id: bookingId,
  })

  if (error) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  if (!cancelled) {
    return { message: 'Booking was not found or is no longer available.' }
  }

  revalidatePath('/cabinet/bookings')

  return { message: undefined }
}
