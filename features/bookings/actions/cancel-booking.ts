'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  const { data: updatedBooking, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', 'confirmed')
    .select('id')
    .maybeSingle()

  if (error) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  if (!updatedBooking) {
    return { message: 'Booking was not found or already cancelled.' }
  }

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard/sessions')

  return { message: undefined }
}
