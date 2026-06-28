'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { bookingFormSchema } from '../model/booking-form-schema'

export type CreateBookingFormState = {
  message?: string
  errors?: {
    sessionId?: string[]
    memberId?: string[]
  }
}

type CreateAdminBookingResult =
  | {
      ok: true
      booking_id: string
    }
  | {
      ok: false
      code: string
    }

function isCreateAdminBookingResult(value: unknown): value is CreateAdminBookingResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (!('ok' in value) || typeof value.ok !== 'boolean') {
    return false
  }

  if (value.ok === true) {
    return 'booking_id' in value && typeof value.booking_id === 'string'
  }

  return 'code' in value && typeof value.code === 'string'
}

const createBookingErrorMessages: Record<string, string> = {
  not_admin: 'You are not allowed to create bookings.',
  session_not_found: 'Selected session was not found.',
  member_not_found: 'Selected member was not found.',
  session_cancelled: 'This session is cancelled.',
  session_not_future: 'This session is no longer available for booking.',
  session_full: 'This session is fully booked.',
  duplicate_booking: 'This member already has a booking for this session.',
  insert_failed: 'Could not create booking. Please try again.',
}

export async function createBooking(
  _prevValue: CreateBookingFormState,
  formData: FormData,
): Promise<CreateBookingFormState> {
  const { user, profile } = await getAuthProfile()

  if (!user) {
    redirect('/sign-in')
  }

  if (profile?.role !== 'admin') {
    redirect('/forbidden')
  }

  const rawData = {
    sessionId: formData.get('sessionId'),
    memberId: formData.get('memberId'),
  }

  const validated = bookingFormSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Invalid form',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { sessionId, memberId } = validated.data
  const supabase = await createClient()

  const { data: result, error } = await supabase.rpc('create_admin_booking', {
    p_session_id: sessionId,
    p_member_id: memberId,
  })

  if (error) {
    return { message: 'Could not create booking. Please try again.' }
  }

  if (!isCreateAdminBookingResult(result)) {
    return { message: 'Could not create booking. Please try again.' }
  }

  if (!result.ok) {
    return {
      message:
        createBookingErrorMessages[result.code] ?? 'Could not create booking. Please try again.',
    }
  }

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard/sessions')
  redirect('/dashboard/bookings')
}
