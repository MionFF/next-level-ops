import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getSubmittedFormData } from '@/test/utils/form-data'
import type { UnlinkProfileMemberFormState } from '../actions/unlink-profile-member'
import UnlinkProfileMemberButton from './unlink-profile-member-button'

jest.mock('../actions/unlink-profile-member', () => ({
  unlinkProfileMember: jest.fn(),
}))

describe('UnlinkProfileMemberButton', () => {
  it('renders unlink button', () => {
    const action = jest.fn<
      Promise<UnlinkProfileMemberFormState>,
      [UnlinkProfileMemberFormState, FormData]
    >()

    render(<UnlinkProfileMemberButton profileId='profile-1' action={action} />)

    expect(screen.getByRole('button', { name: /unlink/i })).toBeInTheDocument()
  })

  it('submits profile id to the unlink action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UnlinkProfileMemberFormState>, [UnlinkProfileMemberFormState, FormData]>()
      .mockResolvedValue({})

    render(<UnlinkProfileMemberButton profileId='profile-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /unlink/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('profileId')).toBe('profile-1')
  })

  it('renders failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<UnlinkProfileMemberFormState>, [UnlinkProfileMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'This profile is not linked to a member.',
        errors: {},
      })

    render(<UnlinkProfileMemberButton profileId='profile-1' action={action} />)

    await user.click(screen.getByRole('button', { name: /unlink/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'This profile is not linked to a member.',
    )
  })
})
