import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UpdateMembershipPlanFormState } from '../actions/update-membership-plan'
import type { EditableMembershipPlan } from '../model/membership-plan'
import EditMembershipPlanForm from './edit-membership-plan-form'
import { getSubmittedFormData } from '@/test/utils/form-data'

jest.mock('../actions/update-membership-plan', () => ({
  updateMembershipPlan: jest.fn(),
}))

const plan: EditableMembershipPlan = {
  id: 'plan-1',
  name: 'Monthly Unlimited',
  description: 'Full access to all classes',
  duration_days: 30,
  price_cents: 9900,
  status: 'active',
}

describe('EditMembershipPlanForm', () => {
  it('renders existing membership plan values', () => {
    const action = jest.fn<
      Promise<UpdateMembershipPlanFormState>,
      [UpdateMembershipPlanFormState, FormData]
    >()

    render(<EditMembershipPlanForm plan={plan} action={action} />)

    expect(screen.getByRole('heading', { name: /edit plan/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('Monthly Unlimited')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Full access to all classes')
    expect(screen.getByLabelText(/duration/i)).toHaveValue(30)
    expect(screen.getByLabelText(/price/i)).toHaveValue(9900)
    expect(screen.getByLabelText(/status/i)).toHaveValue('active')
    expect(screen.getByText(/enter amount in cents/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/dashboard/plans',
    )
  })

  it('submits edited membership plan form data', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateMembershipPlanFormState>, [UpdateMembershipPlanFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(<EditMembershipPlanForm plan={plan} action={action} />)

    await user.clear(screen.getByLabelText(/name/i))
    await user.type(screen.getByLabelText(/name/i), 'Annual Unlimited')
    await user.clear(screen.getByLabelText(/description/i))
    await user.type(screen.getByLabelText(/description/i), 'Annual studio access')
    await user.clear(screen.getByLabelText(/duration/i))
    await user.type(screen.getByLabelText(/duration/i), '365')
    await user.clear(screen.getByLabelText(/price/i))
    await user.type(screen.getByLabelText(/price/i), '99900')
    await user.selectOptions(screen.getByLabelText(/status/i), 'inactive')
    await user.click(screen.getByRole('button', { name: /save plan/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('name')).toBe('Annual Unlimited')
    expect(formData.get('description')).toBe('Annual studio access')
    expect(formData.get('durationDays')).toBe('365')
    expect(formData.get('priceCents')).toBe('99900')
    expect(formData.get('status')).toBe('inactive')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UpdateMembershipPlanFormState>, [UpdateMembershipPlanFormState, FormData]>()
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

    render(<EditMembershipPlanForm plan={plan} action={action} />)

    await user.click(screen.getByRole('button', { name: /save plan/i }))

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
      .fn<Promise<UpdateMembershipPlanFormState>, [UpdateMembershipPlanFormState, FormData]>()
      .mockResolvedValue({
        message: 'Could not update membership plan. Please try again.',
        errors: {},
      })

    render(<EditMembershipPlanForm plan={plan} action={action} />)

    await user.click(screen.getByRole('button', { name: /save plan/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not update membership plan. Please try again.',
    )
  })
})
