import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CreateSessionFormState } from '../actions/create-session'
import CreateSessionForm from './create-session-form'
import { getSubmittedFormData } from '@/test/utils/form-data'
import { selectSingleOption } from '@/test/utils/single-select'

jest.mock('../actions/create-session', () => ({
  createSession: jest.fn(),
}))

const trainers = [
  { id: 'trainer-1', full_name: 'Sam Coach' },
  { id: 'trainer-2', full_name: 'Mia Trainer' },
]

describe('CreateSessionForm', () => {
  it('renders session fields, trainer options, and default status', async () => {
    const user = userEvent.setup()
    const action = jest.fn<Promise<CreateSessionFormState>, [CreateSessionFormState, FormData]>()

    render(<CreateSessionForm trainers={trainers} action={action} />)

    expect(screen.getByRole('heading', { name: /add session/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trainer/i })).toHaveTextContent('Select a trainer')
    await user.click(screen.getByRole('button', { name: /trainer/i }))
    expect(screen.getByRole('radio', { name: /trainer: sam coach/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /trainer: mia trainer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/starts at/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ends at/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /status/i })).toHaveTextContent('Scheduled')
    expect(screen.getByRole('button', { name: /create session/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/sessions',
    )
  })

  it('submits valid session form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateSessionFormState>, [CreateSessionFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<CreateSessionForm trainers={trainers} action={action} />)

    await user.type(screen.getByLabelText(/title/i), 'Morning Strength')
    await selectSingleOption(user, /trainer/i, /trainer: sam coach/i)
    fireEvent.change(screen.getByLabelText(/starts at/i), {
      target: { value: '2026-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText(/ends at/i), {
      target: { value: '2026-06-01T11:00' },
    })
    await user.type(screen.getByLabelText(/capacity/i), '20')
    await selectSingleOption(user, /status/i, /status: cancelled/i)
    await user.click(screen.getByRole('button', { name: /create session/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('title')).toBe('Morning Strength')
    expect(formData.get('trainerId')).toBe('trainer-1')
    expect(formData.get('startsAt')).toBe('2026-06-01T10:00')
    expect(formData.get('endsAt')).toBe('2026-06-01T11:00')
    expect(formData.get('capacity')).toBe('20')
    expect(formData.get('status')).toBe('cancelled')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateSessionFormState>, [CreateSessionFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          title: ['Title is required.'],
          trainerId: ['Select a trainer.'],
          startsAt: ['Start date and time are required.'],
          endsAt: ['End date and time are required.'],
          capacity: ['Capacity must be a positive number.'],
          status: ['Invalid session status.'],
        },
      })

    render(<CreateSessionForm trainers={trainers} action={action} />)

    await user.click(screen.getByRole('button', { name: /create session/i }))

    expect(await screen.findByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Select a trainer.')).toBeInTheDocument()
    expect(screen.getByText('Start date and time are required.')).toBeInTheDocument()
    expect(screen.getByText('End date and time are required.')).toBeInTheDocument()
    expect(screen.getByText('Capacity must be a positive number.')).toBeInTheDocument()
    expect(screen.getByText('Invalid session status.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateSessionFormState>, [CreateSessionFormState, FormData]>()
      .mockResolvedValue({
        message: 'Could not create session. Please try again',
        errors: {},
      })

    render(<CreateSessionForm trainers={trainers} action={action} />)

    await user.type(screen.getByLabelText(/title/i), 'Morning Strength')
    await selectSingleOption(user, /trainer/i, /trainer: sam coach/i)
    fireEvent.change(screen.getByLabelText(/starts at/i), {
      target: { value: '2026-06-01T10:00' },
    })
    fireEvent.change(screen.getByLabelText(/ends at/i), {
      target: { value: '2026-06-01T11:00' },
    })
    await user.type(screen.getByLabelText(/capacity/i), '20')
    await user.click(screen.getByRole('button', { name: /create session/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not create session. Please try again',
    )
  })
})
