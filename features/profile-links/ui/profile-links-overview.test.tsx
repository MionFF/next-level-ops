import { render, screen, within } from '@testing-library/react'
import type { ClientProfile, LinkedProfileMemberPair, MemberOption } from '../model/profile-link'
import ProfileLinksOverview from './profile-links-overview'

jest.mock('./profile-link-form', () => ({
  __esModule: true,
  default: ({ profiles, members }: { profiles: ClientProfile[]; members: MemberOption[] }) => (
    <div data-testid='profile-link-form'>
      Link form: {profiles.length} profiles, {members.length} members
    </div>
  ),
}))

jest.mock('./unlink-profile-member-button', () => ({
  __esModule: true,
  default: ({ profileId }: { profileId: string }) => (
    <button type='button'>Unlink profile {profileId}</button>
  ),
}))

const unlinkedProfiles: ClientProfile[] = [
  {
    id: 'profile-unlinked-1',
    full_name: 'Client One',
    member_id: null,
  },
  {
    id: 'profile-unlinked-2',
    full_name: null,
    member_id: null,
  },
]

const unlinkedMembers: MemberOption[] = [
  {
    id: 'member-unlinked-1',
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
    status: 'active',
  },
  {
    id: 'member-unlinked-2',
    full_name: 'Jamie Lee',
    email: 'jamie@example.com',
    status: 'paused',
  },
]

const linkedPairs: LinkedProfileMemberPair[] = [
  {
    profile: {
      id: 'profile-linked-1',
      full_name: 'Linked Client',
      member_id: 'member-linked-1',
    },
    member: {
      id: 'member-linked-1',
      full_name: 'Linked Member',
      email: 'linked@example.com',
      status: 'active',
    },
  },
]

describe('ProfileLinksOverview', () => {
  it('renders header and summary counts', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
      />,
    )

    expect(screen.getByText('Access control')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /profile links/i })).toBeInTheDocument()

    expect(screen.getByText('Unlinked profiles')).toBeInTheDocument()
    expect(screen.getAllByText('Available members')).toHaveLength(2)
    expect(screen.getByText('Linked pairs')).toBeInTheDocument()

    expect(screen.getByText('Link form: 2 profiles, 2 members')).toBeInTheDocument()
  })

  it('renders current linked pairs and unlink controls', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
      />,
    )

    const linkedPairsTable = screen.getByRole('table')

    expect(
      within(linkedPairsTable).getByRole('row', {
        name: /linked client linked member linked@example.com unlink profile profile-linked-1/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders ready-to-link profile and member previews', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
      />,
    )

    expect(screen.getByText('Client One')).toBeInTheDocument()
    expect(screen.getByText('Unnamed client profile')).toBeInTheDocument()

    expect(screen.getByText('Alex Morgan')).toBeInTheDocument()
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()

    expect(screen.getByText('Jamie Lee')).toBeInTheDocument()
    expect(screen.getByText('jamie@example.com')).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('renders empty states', () => {
    render(<ProfileLinksOverview unlinkedProfiles={[]} unlinkedMembers={[]} linkedPairs={[]} />)

    expect(screen.getByText('No linked profile-member pairs.')).toBeInTheDocument()
    expect(screen.getByText('No unlinked client profiles.')).toBeInTheDocument()
    expect(screen.getByText('No available members.')).toBeInTheDocument()
    expect(screen.getByText('Link form: 0 profiles, 0 members')).toBeInTheDocument()
  })

  it('renders error state without normal dashboard sections', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
        errorMessage='Database error'
      />,
    )

    expect(screen.getByText('Failed to load profile links.')).toBeInTheDocument()
    expect(screen.queryByText('Current links')).not.toBeInTheDocument()
    expect(screen.queryByTestId('profile-link-form')).not.toBeInTheDocument()
  })

  it('does not render technical ids as visible text', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
      />,
    )

    expect(screen.queryByText('profile-unlinked-1')).not.toBeInTheDocument()
    expect(screen.queryByText('member-unlinked-1')).not.toBeInTheDocument()
    expect(screen.queryByText('member-linked-1')).not.toBeInTheDocument()
  })

  it('renders preview overflow counts', () => {
    const manyProfiles: ClientProfile[] = Array.from({ length: 7 }, (_, index) => ({
      id: `profile-${index + 1}`,
      full_name: `Client ${index + 1}`,
      member_id: null,
    }))

    const manyMembers: MemberOption[] = Array.from({ length: 8 }, (_, index) => ({
      id: `member-${index + 1}`,
      full_name: `Member ${index + 1}`,
      email: `member-${index + 1}@example.com`,
      status: 'active',
    }))

    render(
      <ProfileLinksOverview
        unlinkedProfiles={manyProfiles}
        unlinkedMembers={manyMembers}
        linkedPairs={[]}
      />,
    )

    expect(screen.getByText('+ 2 more profiles')).toBeInTheDocument()
    expect(screen.getByText('+ 3 more members')).toBeInTheDocument()
  })

  it('passes unlinked profiles and members to the link form', () => {
    render(
      <ProfileLinksOverview
        unlinkedProfiles={unlinkedProfiles}
        unlinkedMembers={unlinkedMembers}
        linkedPairs={linkedPairs}
      />,
    )

    expect(
      within(screen.getByTestId('profile-link-form')).getByText(/2 profiles/i),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('profile-link-form')).getByText(/2 members/i),
    ).toBeInTheDocument()
  })
})
