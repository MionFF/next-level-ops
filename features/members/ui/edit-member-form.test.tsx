import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditMemberForm from './edit-member-form'
import type { EditableMember } from '../model/member'
import type { UpdateMemberFormState } from '../actions/update-member'

jest.mock('../actions/update-member', () => ({
  updateMember: jest.fn(),
}))

const member: EditableMember = {
  id: 'member-1',
  full_name: 'Alex Morgan',
  email: 'alex@example.com',
  phone: '+1 555 0101',
  status: 'active',
}

function getSubmittedFormData(action: jest.Mock) {
  const formData = action.mock.calls[0]?.[1] as FormData | undefined

  if (!formData) {
    throw new Error('Expected action to be called with FormData')
  }

  return formData
}

describe('EditMemberForm', () => {
  it('renders existing member values', () => {
    const action = jest.fn<Promise<UpdateMemberFormState>, [UpdateMemberFormState, FormData]>()
    render(<EditMemberForm member={member} action={action} />)

    expect(screen.getByRole('heading', { name: /edit member/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Alex Morgan')
    expect(screen.getByLabelText(/email/i)).toHaveValue('alex@example.com')
    expect(screen.getByLabelText(/phone/i)).toHaveValue('+1 555 0101')
    expect(screen.getByLabelText(/status/i)).toHaveValue('active')
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/members/member-1',
    )
  })

  it('submits edited member form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateMemberFormState>, [UpdateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<EditMemberForm member={member} action={action} />)

    await user.clear(screen.getByLabelText(/full name/i))
    await user.type(screen.getByLabelText(/full name/i), 'Alex Updated')
    await user.clear(screen.getByLabelText(/email/i))
    await user.type(screen.getByLabelText(/email/i), 'alex.updated@example.com')
    await user.clear(screen.getByLabelText(/phone/i))
    await user.type(screen.getByLabelText(/phone/i), '+1 555 9999')
    await user.selectOptions(screen.getByLabelText(/status/i), 'inactive')
    await user.click(screen.getByRole('button', { name: /save member/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('fullName')).toBe('Alex Updated')
    expect(formData.get('email')).toBe('alex.updated@example.com')
    expect(formData.get('phone')).toBe('+1 555 9999')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateMemberFormState>, [UpdateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          fullName: ['Full name is required.'],
          email: ['Enter a valid email address.'],
          phone: ['Phone is too long.'],
          status: ['Invalid member status.'],
        },
      })

    render(<EditMemberForm member={member} action={action} />)

    await user.click(screen.getByRole('button', { name: /save member/i }))

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Phone is too long.')).toBeInTheDocument()
    expect(screen.getByText('Invalid member status.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateMemberFormState>, [UpdateMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'Could not update member. Please try again.',
        errors: {},
      })

    render(<EditMemberForm member={member} action={action} />)

    await user.click(screen.getByRole('button', { name: /save member/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not update member. Please try again.',
    )
  })
})
