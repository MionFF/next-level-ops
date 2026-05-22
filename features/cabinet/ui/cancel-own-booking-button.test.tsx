import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CancelOwnBookingFormState } from '../actions/cancel-own-booking'
import { CancelOwnBookingButton } from './cancel-own-booking-button'

jest.mock('../actions/cancel-own-booking', () => ({
  cancelOwnBooking: jest.fn(),
}))

function getSubmittedFormData(action: jest.Mock) {
  const formData = action.mock.calls[0]?.[1] as FormData | undefined

  if (!formData) {
    throw new Error('Expected action to be called with FormData')
  }

  return formData
}

describe('CancelOwnBookingButton', () => {
  it('renders cancel button', () => {
    const action = jest.fn<
      Promise<CancelOwnBookingFormState>,
      [CancelOwnBookingFormState, FormData]
    >()

    render(<CancelOwnBookingButton bookingId='booking-1' action={action} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('submits booking id to the own-booking cancel action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelOwnBookingFormState>, [CancelOwnBookingFormState, FormData]>()
      .mockResolvedValue({
        message: undefined,
      })

    render(<CancelOwnBookingButton bookingId='booking-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('bookingId')).toBe('booking-1')
  })

  it('renders failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelOwnBookingFormState>, [CancelOwnBookingFormState, FormData]>()
      .mockResolvedValue({
        message: 'Booking was not found or is no longer available.',
      })

    render(<CancelOwnBookingButton bookingId='booking-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(
      await screen.findByText('Booking was not found or is no longer available.'),
    ).toBeInTheDocument()
  })
})
