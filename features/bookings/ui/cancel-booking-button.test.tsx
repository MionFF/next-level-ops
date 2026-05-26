import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CancelBookingFormState } from '../actions/cancel-booking'
import CancelBookingButton from './cancel-booking-button'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/cancel-booking', () => ({
  cancelBooking: jest.fn(),
}))

describe('CancelBookingButton', () => {
  it('renders cancel button', () => {
    const action = jest.fn<Promise<CancelBookingFormState>, [CancelBookingFormState, FormData]>()

    render(<CancelBookingButton bookingId='booking-1' action={action} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('submits booking id to the cancel action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelBookingFormState>, [CancelBookingFormState, FormData]>()
      .mockResolvedValue({
        message: undefined,
      })

    render(<CancelBookingButton bookingId='booking-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('bookingId')).toBe('booking-1')
  })

  it('renders failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelBookingFormState>, [CancelBookingFormState, FormData]>()
      .mockResolvedValue({
        message: 'Booking was not found or already cancelled.',
      })

    render(<CancelBookingButton bookingId='booking-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(
      await screen.findByText('Booking was not found or already cancelled.'),
    ).toBeInTheDocument()
  })
})
