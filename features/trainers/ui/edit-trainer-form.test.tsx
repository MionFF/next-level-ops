import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UpdateTrainerFormState } from '../actions/update-trainer'
import type { EditableTrainer } from '../model/trainer'
import EditTrainerForm from './edit-trainer-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/update-trainer', () => ({
  updateTrainer: jest.fn(),
}))

const trainer: EditableTrainer = {
  id: 'trainer-1',
  full_name: 'Sam Coach',
  email: 'sam@example.com',
  phone: '+1 555 0202',
  specialty: 'Strength',
  status: 'active',
}

describe('EditTrainerForm', () => {
  it('renders existing trainer values', () => {
    const action = jest.fn<Promise<UpdateTrainerFormState>, [UpdateTrainerFormState, FormData]>()

    render(<EditTrainerForm trainer={trainer} action={action} />)

    expect(screen.getByRole('heading', { name: /edit trainer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Sam Coach')
    expect(screen.getByLabelText(/email/i)).toHaveValue('sam@example.com')
    expect(screen.getByLabelText(/phone/i)).toHaveValue('+1 555 0202')
    expect(screen.getByLabelText(/specialty/i)).toHaveValue('Strength')
    expect(screen.getByLabelText(/status/i)).toHaveValue('active')
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/trainers',
    )
  })

  it('submits edited trainer form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateTrainerFormState>, [UpdateTrainerFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<EditTrainerForm trainer={trainer} action={action} />)

    await user.clear(screen.getByLabelText(/full name/i))
    await user.type(screen.getByLabelText(/full name/i), 'Sam Updated')
    await user.clear(screen.getByLabelText(/email/i))
    await user.type(screen.getByLabelText(/email/i), 'sam.updated@example.com')
    await user.clear(screen.getByLabelText(/phone/i))
    await user.type(screen.getByLabelText(/phone/i), '+1 555 9999')
    await user.clear(screen.getByLabelText(/specialty/i))
    await user.type(screen.getByLabelText(/specialty/i), 'Mobility')
    await user.selectOptions(screen.getByLabelText(/status/i), 'inactive')
    await user.click(screen.getByRole('button', { name: /save trainer/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('fullName')).toBe('Sam Updated')
    expect(formData.get('email')).toBe('sam.updated@example.com')
    expect(formData.get('phone')).toBe('+1 555 9999')
    expect(formData.get('specialty')).toBe('Mobility')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateTrainerFormState>, [UpdateTrainerFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          fullName: ['Full name is required.'],
          email: ['Enter a valid email address.'],
          phone: ['Phone is too long.'],
          specialty: ['Specialty is too long.'],
          status: ['Invalid trainer status.'],
        },
      })

    render(<EditTrainerForm trainer={trainer} action={action} />)

    await user.click(screen.getByRole('button', { name: /save trainer/i }))

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Phone is too long.')).toBeInTheDocument()
    expect(screen.getByText('Specialty is too long.')).toBeInTheDocument()
    expect(screen.getByText('Invalid trainer status.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateTrainerFormState>, [UpdateTrainerFormState, FormData]>()
      .mockResolvedValue({
        message: 'Could not update trainer. Please try again.',
        errors: {},
      })

    render(<EditTrainerForm trainer={trainer} action={action} />)

    await user.click(screen.getByRole('button', { name: /save trainer/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not update trainer. Please try again.',
    )
  })
})
