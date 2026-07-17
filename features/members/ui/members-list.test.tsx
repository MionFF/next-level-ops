import { render, screen } from '@testing-library/react'
import type { MemberOperationRow } from '../model/member'
import MembersList from './members-list'

const members: MemberOperationRow[] = [
  {
    id: 'member-1',
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+1 555 0101',
    status: 'active',
    created_at: '2026-05-20T10:00:00.000Z',
    is_profile_linked: true,
    membership_status: 'active',
    membership_plan_name: 'Monthly Unlimited',
    membership_starts_at: '2026-05-01',
    membership_ends_at: '2026-05-31',
  },
  {
    id: 'member-2',
    full_name: 'Jamie Lee',
    email: 'jamie@example.com',
    phone: null,
    status: 'paused',
    created_at: '2026-05-21T10:00:00.000Z',
    is_profile_linked: false,
    membership_status: 'none',
    membership_plan_name: null,
    membership_starts_at: null,
    membership_ends_at: null,
  },
]

describe('MembersList', () => {
  it('renders error state when members fail to load', () => {
    render(<MembersList members={[]} errorMessage='Database error' />)

    expect(screen.getByText('Failed to load members.')).toBeInTheDocument()
    expect(screen.queryByText('No members found.')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no members', () => {
    render(<MembersList members={[]} errorMessage={undefined} />)

    expect(screen.getByText('No members found.')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load members.')).not.toBeInTheDocument()
  })

  it('renders operations table headings', () => {
    render(<MembersList members={members} errorMessage={undefined} />)

    expect(screen.getByRole('columnheader', { name: 'Member' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Membership' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
  })

  it('renders operational member data across desktop and mobile views', () => {
    render(<MembersList members={members} errorMessage={undefined} />)

    expect(screen.getByRole('heading', { name: /^members$/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add member/i })).toHaveAttribute(
      'href',
      '/dashboard/members/new',
    )

    expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('alex@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+1 555 0101').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Linked').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Monthly Unlimited').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Jamie Lee').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jamie@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No phone').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Paused').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unlinked').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No plan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No membership').length).toBeGreaterThan(0)
  })

  it('renders detail and edit actions for every member view', () => {
    render(<MembersList members={members} errorMessage={undefined} />)

    const alexDetailLinks = screen.getAllByRole('link', {
      name: 'Alex Morgan',
    })

    for (const link of alexDetailLinks) {
      expect(link).toHaveAttribute('href', '/dashboard/members/member-1')
    }

    const viewLinks = screen.getAllByRole('link', { name: 'View' })
    const editLinks = screen.getAllByRole('link', { name: 'Edit' })

    expect(viewLinks).toHaveLength(4)
    expect(editLinks).toHaveLength(4)

    expect(
      viewLinks.filter(link => link.getAttribute('href') === '/dashboard/members/member-1'),
    ).toHaveLength(2)
    expect(
      viewLinks.filter(link => link.getAttribute('href') === '/dashboard/members/member-2'),
    ).toHaveLength(2)
    expect(
      editLinks.filter(link => link.getAttribute('href') === '/dashboard/members/member-1/edit'),
    ).toHaveLength(2)
    expect(
      editLinks.filter(link => link.getAttribute('href') === '/dashboard/members/member-2/edit'),
    ).toHaveLength(2)
  })
})
