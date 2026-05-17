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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('member_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profileData?.member_id) {
    return { message: 'Could not cancel booking. Please try again.' }
  }

  const unavailableMessage = 'Booking was not found or is no longer available.'

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      `
      id,
      member_id,
      status,
      session:sessions(id, starts_at)
    `,
    )
    .eq('id', bookingId)
    .maybeSingle()

  const session = Array.isArray(booking?.session) ? (booking.session[0] ?? null) : booking?.session

  const now = Date.now()

  if (
    !booking ||
    booking.member_id !== profileData.member_id ||
    booking.status !== 'confirmed' ||
    !session ||
    new Date(session.starts_at).getTime() <= now
  ) {
    return { message: unavailableMessage }
  }

  const { data: updatedBooking, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('member_id', profileData.member_id)
    .eq('status', 'confirmed')
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('cancelOwnBooking update error:', error)

    return { message: 'Could not cancel booking. Please try again.' }
  }

  if (!updatedBooking) {
    return { message: unavailableMessage }
  }

  revalidatePath('/cabinet/bookings')

  return { message: undefined }
}
