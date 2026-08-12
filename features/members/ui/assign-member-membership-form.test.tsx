import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getSubmittedFormData } from '@/test/utils/form-data'
import { AssignMemberMembershipForm } from './assign-member-membership-form'
import type { AssignMemberMembershipFormState } from '../actions/assign-member-membership'
import { selectSingleOption } from '@/test/utils/single-select'

jest.mock('../actions/assign-member-membership', () => ({
  assignMemberMembership: jest.fn(),
}))

const activePlans = [
  {
    id: 'plan-monthly',
    name: 'Monthly Unlimited',
    duration_days: 30,
  },
  {
    id: 'plan-drop-in',
    name: 'Drop-in',
    duration_days: 1,
  },
]

function renderForm(
  overrides: Partial<React.ComponentProps<typeof AssignMemberMembershipForm>> = {},
) {
  const action = jest
    .fn<Promise<AssignMemberMembershipFormState>, [AssignMemberMembershipFormState, FormData]>()
    .mockResolvedValue({
      message: '',
      errors: {},
    })

  render(
    <AssignMemberMembershipForm
      memberId='member-1'
      plans={activePlans}
      defaultStartDate='2026-07-08'
      minStartDate='2026-07-08'
      isRenewal={false}
      action={action}
      {...overrides}
    />,
  )

  return { action }
}

describe('AssignMemberMembershipForm', () => {
  it('renders available active plans and start date', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByRole('heading', { name: /assign membership/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /plan/i })).toHaveTextContent('Select plan')
    await user.click(screen.getByRole('button', { name: /plan/i }))
    expect(
      screen.getByRole('radio', { name: /plan: monthly unlimited — 30 days/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /plan: drop-in — 1 days/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2026-07-08')
    expect(screen.getByLabelText(/start date/i)).toHaveAttribute('min', '2026-07-08')
    expect(screen.getByRole('button', { name: /assign membership/i })).toBeInTheDocument()
  })

  it('renders renewal copy when current membership exists', () => {
    renderForm({
      isRenewal: true,
      defaultStartDate: '2026-08-07',
    })

    expect(screen.getByRole('heading', { name: /renew membership/i })).toBeInTheDocument()
    expect(
      screen.getByText(
        /select an active plan for the next membership period\. the start date defaults to the current membership end date\./i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2026-08-07')
    expect(screen.getByRole('button', { name: /renew membership/i })).toBeInTheDocument()
  })

  it('submits selected plan, start date, and member id', async () => {
    const user = userEvent.setup()
    const { action } = renderForm()

    await selectSingleOption(user, /plan/i, /plan: monthly unlimited — 30 days/i)
    await user.clear(screen.getByLabelText(/start date/i))
    await user.type(screen.getByLabelText(/start date/i), '2026-07-10')
    await user.click(screen.getByRole('button', { name: /assign membership/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('memberId')).toBe('member-1')
    expect(formData.get('planId')).toBe('plan-monthly')
    expect(formData.get('startsAt')).toBe('2026-07-10')
  })

  it('renders disabled empty state when there are no active plans', () => {
    renderForm({
      plans: [],
    })

    expect(screen.getByRole('button', { name: /plan:/i })).toBeDisabled()
    expect(screen.getByLabelText(/start date/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /assign membership/i })).toBeDisabled()
    expect(screen.getByText(/no active membership plans available/i)).toBeInTheDocument()
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<AssignMemberMembershipFormState>, [AssignMemberMembershipFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          planId: ['Membership plan is required'],
          startsAt: ['Start date cannot be in the past'],
        },
      })

    renderForm({ action })

    await user.click(screen.getByRole('button', { name: /assign membership/i }))

    expect(await screen.findByText('Membership plan is required')).toBeInTheDocument()
    expect(screen.getByText('Start date cannot be in the past')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders action-level business errors', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<AssignMemberMembershipFormState>, [AssignMemberMembershipFormState, FormData]>()
      .mockResolvedValue({
        message: 'This member already has an active or scheduled membership for this period.',
        errors: {},
      })

    renderForm({ action })

    await selectSingleOption(user, /plan/i, /plan: monthly unlimited — 30 days/i)
    await user.click(screen.getByRole('button', { name: /assign membership/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'This member already has an active or scheduled membership for this period.',
    )
  })
})
