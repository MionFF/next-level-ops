import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UpdateSessionFormState } from '../actions/update-session'
import type { EditableSession } from '../model/session'
import EditSessionForm from './edit-session-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/update-session', () => ({
  updateSession: jest.fn(),
}))

const trainers = [
  { id: 'trainer-1', full_name: 'Sam Coach' },
  { id: 'trainer-2', full_name: 'Mia Trainer' },
]

const session: EditableSession = {
  id: 'session-1',
  title: 'Morning Strength',
  trainer_id: 'trainer-1',
  starts_at: '2026-06-01T10:00:00.000Z',
  ends_at: '2026-06-01T11:00:00.000Z',
  capacity: 20,
  status: 'scheduled',
}

describe('EditSessionForm', () => {
  it('renders existing session values and trainer options', () => {
    const action = jest.fn<Promise<UpdateSessionFormState>, [UpdateSessionFormState, FormData]>()

    render(<EditSessionForm session={session} trainers={trainers} action={action} />)

    expect(screen.getByRole('heading', { name: /edit session/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toHaveValue('Morning Strength')
    expect(screen.getByLabelText(/trainer/i)).toHaveValue('trainer-1')
    expect(screen.getByRole('option', { name: /sam coach/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /mia trainer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/starts at/i)).toHaveValue('2026-06-01T10:00')
    expect(screen.getByLabelText(/ends at/i)).toHaveValue('2026-06-01T11:00')
    expect(screen.getByLabelText(/capacity/i)).toHaveValue(20)
    expect(screen.getByLabelText(/status/i)).toHaveValue('scheduled')
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/sessions',
    )
  })

  it('submits edited session form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateSessionFormState>, [UpdateSessionFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<EditSessionForm session={session} trainers={trainers} action={action} />)

    await user.clear(screen.getByLabelText(/title/i))
    await user.type(screen.getByLabelText(/title/i), 'Evening Mobility')
    await user.selectOptions(screen.getByLabelText(/trainer/i), 'trainer-2')
    fireEvent.change(screen.getByLabelText(/starts at/i), {
      target: { value: '2026-06-02T18:00' },
    })
    fireEvent.change(screen.getByLabelText(/ends at/i), {
      target: { value: '2026-06-02T19:00' },
    })
    await user.clear(screen.getByLabelText(/capacity/i))
    await user.type(screen.getByLabelText(/capacity/i), '12')
    await user.selectOptions(screen.getByLabelText(/status/i), 'cancelled')
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('title')).toBe('Evening Mobility')
    expect(formData.get('trainerId')).toBe('trainer-2')
    expect(formData.get('startsAt')).toBe('2026-06-02T18:00')
    expect(formData.get('endsAt')).toBe('2026-06-02T19:00')
    expect(formData.get('capacity')).toBe('12')
    expect(formData.get('status')).toBe('cancelled')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateSessionFormState>, [UpdateSessionFormState, FormData]>()
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

    render(<EditSessionForm session={session} trainers={trainers} action={action} />)

    await user.click(screen.getByRole('button', { name: /save session/i }))

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
      .fn<Promise<UpdateSessionFormState>, [UpdateSessionFormState, FormData]>()
      .mockResolvedValue({
        message: 'Could not update session. Please try again',
        errors: {},
      })

    render(<EditSessionForm session={session} trainers={trainers} action={action} />)

    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not update session. Please try again',
    )
  })
})
