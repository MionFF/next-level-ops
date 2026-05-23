import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SignInFormState } from '../actions/signIn'
import SignInForm from './sign-in-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/signIn', () => ({
  signIn: jest.fn(),
}))

describe('SignInForm', () => {
  it('renders sign-in fields and sign-up link', () => {
    const action = jest.fn<Promise<SignInFormState>, [SignInFormState, FormData]>()

    render(<SignInForm action={action} />)

    expect(screen.getByRole('heading', { name: /sign in to your workspace/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/sign-up')
  })

  it('submits email and password form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignInFormState>, [SignInFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<SignInForm action={action} />)

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secure-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('email')).toBe('admin@example.com')
    expect(formData.get('password')).toBe('secure-password')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignInFormState>, [SignInFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          email: ['Enter a valid email address.'],
          password: ['Password is required.'],
        },
      })

    render(<SignInForm action={action} />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level auth failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<SignInFormState>, [SignInFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid login credentials',
        errors: {},
      })

    render(<SignInForm action={action} />)

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('Invalid login credentials')
  })
})
