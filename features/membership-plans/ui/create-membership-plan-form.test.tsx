import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CreateMembershipPlanFormState } from '../actions/create-membership-plan'
import CreateMembershipPlanForm from './create-membership-plan-form'
import { getSubmittedFormData } from '@/test/utils/form-data'
import { selectSingleOption } from '@/test/utils/single-select'

jest.mock('../actions/create-membership-plan', () => ({
  createMembershipPlan: jest.fn(),
}))

describe('CreateMembershipPlanForm', () => {
  it('renders membership plan fields and default status', () => {
    const action = jest.fn<
      Promise<CreateMembershipPlanFormState>,
      [CreateMembershipPlanFormState, FormData]
    >()

    render(<CreateMembershipPlanForm action={action} />)

    expect(screen.getByRole('heading', { name: /add plan/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /status/i })).toHaveTextContent('Active')
    expect(screen.getByText(/enter amount in cents/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/plans',
    )
  })

  it('submits valid membership plan form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMembershipPlanFormState>, [CreateMembershipPlanFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<CreateMembershipPlanForm action={action} />)

    await user.type(screen.getByLabelText(/name/i), 'Monthly Unlimited')
    await user.type(screen.getByLabelText(/description/i), 'Full access to all classes')
    await user.type(screen.getByLabelText(/duration/i), '30')
    await user.type(screen.getByLabelText(/price/i), '9900')
    await selectSingleOption(user, /status/i, /status: inactive/i)
    await user.click(screen.getByRole('button', { name: /create plan/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('name')).toBe('Monthly Unlimited')
    expect(formData.get('description')).toBe('Full access to all classes')
    expect(formData.get('durationDays')).toBe('30')
    expect(formData.get('priceCents')).toBe('9900')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMembershipPlanFormState>, [CreateMembershipPlanFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          name: ['Name is required.'],
          description: ['Description is too long.'],
          durationDays: ['Duration must be a positive number.'],
          priceCents: ['Price must be a non-negative amount in cents.'],
          status: ['Invalid membership plan status.'],
        },
      })

    render(<CreateMembershipPlanForm action={action} />)

    await user.click(screen.getByRole('button', { name: /create plan/i }))

    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Description is too long.')).toBeInTheDocument()
    expect(screen.getByText('Duration must be a positive number.')).toBeInTheDocument()
    expect(screen.getByText('Price must be a non-negative amount in cents.')).toBeInTheDocument()
    expect(screen.getByText('Invalid membership plan status.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level failure message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CreateMembershipPlanFormState>, [CreateMembershipPlanFormState, FormData]>()
      .mockResolvedValue({
        message: 'A membership plan with this name already exists.',
        errors: {},
      })

    render(<CreateMembershipPlanForm action={action} />)

    await user.type(screen.getByLabelText(/name/i), 'Monthly Unlimited')
    await user.type(screen.getByLabelText(/duration/i), '30')
    await user.type(screen.getByLabelText(/price/i), '9900')
    await user.click(screen.getByRole('button', { name: /create plan/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'A membership plan with this name already exists.',
    )
  })
})
