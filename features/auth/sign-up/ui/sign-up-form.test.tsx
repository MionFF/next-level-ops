import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SignUpFormState } from '../actions/signUp'
import SignUpForm from './sign-up-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/signUp', () => ({
  signUp: jest.fn(),
}))

describe('SignUpForm', () => {
  it('renders sign-up fields and sign-in link', () => {
    const action = jest.fn<Promise<SignUpFormState>, [SignUpFormState, FormData]>()

    render(<SignUpForm action={action} />)

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
  })

  it('submits full sign-up form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignUpFormState>, [SignUpFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<SignUpForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secure-password')
    await user.type(screen.getByLabelText(/confirm password/i), 'secure-password')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('fullName')).toBe('Alex Morgan')
    expect(formData.get('email')).toBe('alex@example.com')
    expect(formData.get('password')).toBe('secure-password')
    expect(formData.get('confirmPassword')).toBe('secure-password')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignUpFormState>, [SignUpFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          fullName: ['Full name is required.'],
          email: ['Enter a valid email address.'],
          password: ['Password must be at least 8 characters.'],
        },
      })

    render(<SignUpForm action={action} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders password mismatch error returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignUpFormState>, [SignUpFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          confirmPassword: ['Passwords do not match.'],
        },
      })

    render(<SignUpForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secure-password')
    await user.type(screen.getByLabelText(/confirm password/i), 'different-password')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level sign-up failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignUpFormState>, [SignUpFormState, FormData]>()
      .mockResolvedValue({
        message: 'User already registered',
        errors: {},
      })

    render(<SignUpForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secure-password')
    await user.type(screen.getByLabelText(/confirm password/i), 'secure-password')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('User already registered')
  })
})
