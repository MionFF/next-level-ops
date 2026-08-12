import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CreateBookingFormState } from '../actions/create-booking'
import CreateBookingForm from './create-booking-form'
import { getSubmittedFormData } from '@/test/utils/form-data'
import { selectSingleOption } from '@/test/utils/single-select'

jest.mock('../actions/create-booking', () => ({
  createBooking: jest.fn(),
}))

const sessions = [
  {
    id: 'session-1',
    title: 'Morning Strength',
    starts_at: '2026-06-01T10:00:00.000Z',
    trainer: {
      full_name: 'Sam Coach',
    },
  },
  {
    id: 'session-2',
    title: 'Evening Mobility',
    starts_at: '2026-06-02T18:00:00.000Z',
    trainer: null,
  },
]

const members = [
  {
    id: 'member-1',
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
  },
  {
    id: 'member-2',
    full_name: 'Jamie Lee',
    email: 'jamie@example.com',
  },
]

describe('CreateBookingForm', () => {
  it('renders booking fields, session options, member options, and empty defaults', async () => {
    const user = userEvent.setup()
    const action = jest.fn<Promise<CreateBookingFormState>, [CreateBookingFormState, FormData]>()

    render(<CreateBookingForm sessions={sessions} members={members} action={action} />)

    expect(screen.getByRole('heading', { name: /add booking/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /^session:/i })).toHaveTextContent(
      'Select a session',
    )
    await user.click(screen.getByRole('button', { name: /^session:/i }))
    expect(screen.getByRole('radio', { name: /session: select a session/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /session: morning strength/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /sam coach/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /session: evening mobility/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /^member:/i })).toHaveTextContent('Select a member')
    await user.click(screen.getByRole('button', { name: /^member:/i }))
    expect(screen.getByRole('radio', { name: /member: select a member/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /member: alex morgan/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /alex@example.com/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /member: jamie lee/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /create booking/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/bookings',
    )
  })

  it('submits selected session and member ids', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateBookingFormState>, [CreateBookingFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<CreateBookingForm sessions={sessions} members={members} action={action} />)

    await selectSingleOption(user, /^session:/i, /session: morning strength/i)
    await selectSingleOption(user, /^member:/i, /member: jamie lee/i)
    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('sessionId')).toBe('session-1')
    expect(formData.get('memberId')).toBe('member-2')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateBookingFormState>, [CreateBookingFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          sessionId: ['Select a session.'],
          memberId: ['Select a member.'],
        },
      })

    render(<CreateBookingForm sessions={sessions} members={members} action={action} />)

    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(await screen.findByText('Select a session.')).toBeInTheDocument()
    expect(screen.getByText('Select a member.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders business failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateBookingFormState>, [CreateBookingFormState, FormData]>()
      .mockResolvedValue({
        message: 'This member already has a booking for this session.',
        errors: {},
      })

    render(<CreateBookingForm sessions={sessions} members={members} action={action} />)

    await selectSingleOption(user, /^session:/i, /session: morning strength/i)
    await selectSingleOption(user, /^member:/i, /member: alex morgan/i)
    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'This member already has a booking for this session.',
    )
  })

  it('renders availability failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateBookingFormState>, [CreateBookingFormState, FormData]>()
      .mockResolvedValue({
        message: 'This session is fully booked.',
        errors: {},
      })

    render(<CreateBookingForm sessions={sessions} members={members} action={action} />)

    await selectSingleOption(user, /^session:/i, /session: morning strength/i)
    await selectSingleOption(user, /^member:/i, /member: alex morgan/i)
    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('This session is fully booked.')
  })
})
