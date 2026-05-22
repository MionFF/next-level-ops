import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CreateTrainerFormState } from '../actions/create-trainer'
import CreateTrainerForm from './create-trainer-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/create-trainer', () => ({
  createTrainer: jest.fn(),
}))

describe('CreateTrainerForm', () => {
  it('renders trainer fields and default status', () => {
    const action = jest.fn<Promise<CreateTrainerFormState>, [CreateTrainerFormState, FormData]>()

    render(<CreateTrainerForm action={action} />)

    expect(screen.getByRole('heading', { name: /add trainer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toHaveValue('active')
    expect(screen.getByRole('button', { name: /create trainer/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/trainers',
    )
  })

  it('submits valid trainer form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateTrainerFormState>, [CreateTrainerFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<CreateTrainerForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Sam Coach')
    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+1 555 0202')
    await user.type(screen.getByLabelText(/specialty/i), 'Strength')
    await user.selectOptions(screen.getByLabelText(/status/i), 'inactive')
    await user.click(screen.getByRole('button', { name: /create trainer/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('fullName')).toBe('Sam Coach')
    expect(formData.get('email')).toBe('sam@example.com')
    expect(formData.get('phone')).toBe('+1 555 0202')
    expect(formData.get('specialty')).toBe('Strength')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateTrainerFormState>, [CreateTrainerFormState, FormData]>()
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

    render(<CreateTrainerForm action={action} />)

    await user.click(screen.getByRole('button', { name: /create trainer/i }))

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
      .fn<Promise<CreateTrainerFormState>, [CreateTrainerFormState, FormData]>()
      .mockResolvedValue({
        message: 'A trainer with this email already exists.',
        errors: {},
      })

    render(<CreateTrainerForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Sam Coach')
    await user.type(screen.getByLabelText(/email/i), 'sam@example.com')
    await user.click(screen.getByRole('button', { name: /create trainer/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'A trainer with this email already exists.',
    )
  })
})
