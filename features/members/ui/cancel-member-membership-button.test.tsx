import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getSubmittedFormData } from '@/test/utils/form-data'
import { CancelMemberMembershipButton } from './cancel-member-membership-button'
import type { CancelMemberMembershipFormState } from '../actions/cancel-member-membership'

jest.mock('../actions/cancel-member-membership', () => ({
  cancelMemberMembership: jest.fn(),
}))

describe('CancelMemberMembershipButton', () => {
  it('submits member and membership ids', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelMemberMembershipFormState>, [CancelMemberMembershipFormState, FormData]>()
      .mockResolvedValue({
        message: '',
        errors: {},
      })

    render(
      <CancelMemberMembershipButton
        memberId='member-1'
        membershipId='membership-1'
        action={action}
      />,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('memberId')).toBe('member-1')
    expect(formData.get('membershipId')).toBe('membership-1')
  })

  it('renders action error message', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<CancelMemberMembershipFormState>, [CancelMemberMembershipFormState, FormData]>()
      .mockResolvedValue({
        message: 'Only active or upcoming memberships can be cancelled.',
        errors: {},
      })

    render(
      <CancelMemberMembershipButton
        memberId='member-1'
        membershipId='membership-1'
        action={action}
      />,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Only active or upcoming memberships can be cancelled.',
    )
  })
})
