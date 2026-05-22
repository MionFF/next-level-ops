import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateMemberForm from './create-member-form'
import type { CreateMemberFormState } from '../actions/create-member'

jest.mock('../actions/create-member', () => ({
  createMember: jest.fn(),
}))

function getSubmittedFormData(action: jest.Mock) {
  const formData = action.mock.calls[0]?.[1] as FormData | undefined

  if (!formData) {
    throw new Error('Expected action to be called with FormData')
  }

  return formData
}

describe('CreateMemberForm', () => {
  it('renders member fields and default status', () => {
    const action = jest.fn<Promise<CreateMemberFormState>, [CreateMemberFormState, FormData]>()
    render(<CreateMemberForm action={action} />)

    expect(screen.getByRole('heading', { name: /add member/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toHaveValue('active')
    expect(screen.getByRole('button', { name: /create member/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/members',
    )
  })

  it('submits valid member form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMemberFormState>, [CreateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<CreateMemberForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+1 555 0101')
    await user.selectOptions(screen.getByLabelText(/status/i), 'inactive')
    await user.click(screen.getByRole('button', { name: /create member/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('fullName')).toBe('Alex Morgan')
    expect(formData.get('email')).toBe('alex@example.com')
    expect(formData.get('phone')).toBe('+1 555 0101')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMemberFormState>, [CreateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          fullName: ['Full name is required.'],
          email: ['Enter a valid email address.'],
          phone: ['Phone is too long.'],
          status: ['Invalid member status.'],
        },
      })

    render(<CreateMemberForm action={action} />)

    await user.click(screen.getByRole('button', { name: /create member/i }))

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Phone is too long.')).toBeInTheDocument()
    expect(screen.getByText('Invalid member status.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMemberFormState>, [CreateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'A member with this email already exists.',
        errors: {},
      })

    render(<CreateMemberForm action={action} />)

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.click(screen.getByRole('button', { name: /create member/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'A member with this email already exists.',
    )
  })
})
