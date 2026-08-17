import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getSubmittedFormData } from '@/test/utils/form-data'
import type { LinkProfileMemberFormState } from '../actions/link-profile-member'
import ProfileLinkForm from './profile-link-form'
import { selectSingleOption } from '@/test/utils/single-select'

jest.mock('../actions/link-profile-member', () => ({
  linkProfileMember: jest.fn(),
}))

const profiles = [
  {
    id: 'profile-1',
    full_name: 'Client One',
    member_id: null,
  },
  {
    id: 'profile-2',
    full_name: null,
    member_id: null,
  },
]

const members = [
  {
    id: 'member-1',
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
    status: 'active',
  },
  {
    id: 'member-2',
    full_name: 'Jamie Lee',
    email: 'jamie@example.com',
    status: 'paused',
  },
]

describe('ProfileLinkForm', () => {
  it('renders profile and member options', async () => {
    const user = userEvent.setup()
    const action = jest.fn<
      Promise<LinkProfileMemberFormState>,
      [LinkProfileMemberFormState, FormData]
    >()

    render(<ProfileLinkForm profiles={profiles} members={members} action={action} />)

    expect(screen.getByRole('heading', { name: /create link/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /client profile/i })).toHaveTextContent(
      'Select profile',
    )
    expect(screen.getByRole('button', { name: /available member/i })).toHaveTextContent(
      'Select member',
    )

    await user.click(screen.getByRole('button', { name: /client profile/i }))
    expect(screen.getByRole('radio', { name: /client profile: client one/i })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /client profile: unnamed client profile/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /available member/i }))
    expect(
      screen.getByRole('radio', { name: /available member: alex morgan/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /available member: alex morgan — alex@example.com/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /available member: jamie lee/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /link profile/i })).toBeInTheDocument()
  })

  it('submits selected profile and member ids', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<LinkProfileMemberFormState>, [LinkProfileMemberFormState, FormData]>()
      .mockResolvedValue({})

    render(<ProfileLinkForm profiles={profiles} members={members} action={action} />)

    await selectSingleOption(user, /client profile/i, /client profile: client one/i)
    await selectSingleOption(user, /available member/i, /available member: jamie lee/i)
    await user.click(screen.getByRole('button', { name: /link profile/i }))

    expect(action).toHaveBeenCalledTimes(1)

    const formData = getSubmittedFormData(action)

    expect(formData.get('profileId')).toBe('profile-1')
    expect(formData.get('memberId')).toBe('member-2')
  })

  it('renders validation errors returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<LinkProfileMemberFormState>, [LinkProfileMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'Invalid form',
        errors: {
          profileId: ['Client profile is required'],
          memberId: ['Member is required'],
        },
      })

    render(<ProfileLinkForm profiles={profiles} members={members} action={action} />)

    await user.click(screen.getByRole('button', { name: /link profile/i }))

    expect(await screen.findByText('Client profile is required')).toBeInTheDocument()
    expect(screen.getByText('Member is required')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Invalid form')
  })

  it('renders business failure message returned by the action', async () => {
    const user = userEvent.setup()
    const action = jest
      .fn<Promise<LinkProfileMemberFormState>, [LinkProfileMemberFormState, FormData]>()
      .mockResolvedValue({
        message: 'This member is already linked to another profile.',
        errors: {},
      })

    render(<ProfileLinkForm profiles={profiles} members={members} action={action} />)

    await selectSingleOption(user, /client profile/i, /client profile: client one/i)
    await selectSingleOption(user, /available member/i, /available member: alex morgan/i)
    await user.click(screen.getByRole('button', { name: /link profile/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'This member is already linked to another profile.',
    )
  })

  it('disables form when there are no unlinked profiles', () => {
    const action = jest.fn<
      Promise<LinkProfileMemberFormState>,
      [LinkProfileMemberFormState, FormData]
    >()

    render(<ProfileLinkForm profiles={[]} members={members} action={action} />)

    expect(screen.getByRole('button', { name: /client profile/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /available member/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /link profile/i })).toBeDisabled()
    expect(
      screen.getByText(/linking requires at least one unlinked client profile/i),
    ).toBeInTheDocument()
  })

  it('disables form when there are no available members', () => {
    const action = jest.fn<
      Promise<LinkProfileMemberFormState>,
      [LinkProfileMemberFormState, FormData]
    >()

    render(<ProfileLinkForm profiles={profiles} members={[]} action={action} />)

    expect(screen.getByRole('button', { name: /client profile/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /available member/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /link profile/i })).toBeDisabled()
    expect(screen.getByText(/one available member/i)).toBeInTheDocument()
  })

  it('does not render technical ids as visible text', () => {
    const action = jest.fn<
      Promise<LinkProfileMemberFormState>,
      [LinkProfileMemberFormState, FormData]
    >()

    render(<ProfileLinkForm profiles={profiles} members={members} action={action} />)

    expect(screen.queryByText('profile-1')).not.toBeInTheDocument()
    expect(screen.queryByText('member-1')).not.toBeInTheDocument()
  })

  it('clears selections when refreshed options no longer contain the selected records', async () => {
    const user = userEvent.setup()
    const action = jest.fn<
      Promise<LinkProfileMemberFormState>,
      [LinkProfileMemberFormState, FormData]
    >()

    const { rerender } = render(
      <ProfileLinkForm profiles={profiles} members={members} action={action} />,
    )

    await selectSingleOption(user, /client profile/i, /client profile: client one/i)
    await selectSingleOption(user, /available member/i, /available member: alex morgan/i)

    expect(screen.getByRole('button', { name: /client profile: client one/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /available member: alex morgan/i })).toBeVisible()

    rerender(
      <ProfileLinkForm
        profiles={profiles.filter(profile => profile.id !== 'profile-1')}
        members={members.filter(member => member.id !== 'member-1')}
        action={action}
      />,
    )

    expect(screen.getByRole('button', { name: 'Client profile: Select profile' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Available member: Select member' })).toBeVisible()

    expect(screen.queryByText('profile-1')).not.toBeInTheDocument()
    expect(screen.queryByText('member-1')).not.toBeInTheDocument()
  })
})
