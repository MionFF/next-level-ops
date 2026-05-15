'use server'

import { getAuthProfile } from '@/features/auth/model/get-auth-profile'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { bookingFormSchema } from '../model/booking-form-schema'

type CreateBookingFormState = {
  message?: string
  errors?: {
    sessionId?: string[]
    memberId?: string[]
  }
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

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, status, capacity')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { message: 'Could not create booking. Please try again.' }
  }

  if (session.status === 'cancelled') {
    return { message: 'This session is cancelled.' }
  }

  const { count: confirmedCount, error: countError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('status', 'confirmed')

  if (countError) {
    return { message: 'Could not create booking. Please try again.' }
  }

  if (confirmedCount != null && confirmedCount >= session.capacity) {
    return { message: 'This session is fully booked.' }
  }

  const { data: existingBooking, error: duplicateError } = await supabase
    .from('bookings')
    .select('id')
    .eq('session_id', sessionId)
    .eq('member_id', memberId)
    .eq('status', 'confirmed')
    .maybeSingle()

  if (duplicateError) {
    return { message: 'Could not create booking. Please try again.' }
  }

  if (existingBooking) {
    return { message: 'This member already has a booking for this session.' }
  }

  const { error: insertError } = await supabase.from('bookings').insert({
    session_id: sessionId,
    member_id: memberId,
    status: 'confirmed',
  })

  if (insertError) {
    return { message: 'Could not create booking. Please try again.' }
  }

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard/sessions')
  redirect('/dashboard/bookings')
}
