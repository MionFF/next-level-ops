import { render, screen } from '@testing-library/react'
import type { Member } from '../model/member'
import MembersList from './members-list'

const members: Member[] = [
  {
    id: 'member-1',
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+1 555 0101',
    status: 'active',
    created_at: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'member-2',
    full_name: 'Jamie Lee',
    email: 'jamie@example.com',
    phone: null,
    status: 'paused',
    created_at: '2026-05-21T10:00:00.000Z',
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

  it('renders member data and primary actions', () => {
    render(<MembersList members={members} errorMessage={undefined} />)

    expect(screen.getByRole('heading', { name: /members/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add member/i })).toHaveAttribute(
      'href',
      '/dashboard/members/new',
    )

    expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('alex@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+1 555 0101').length).toBeGreaterThan(0)
    expect(screen.getAllByText('active').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Jamie Lee').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jamie@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('paused').length).toBeGreaterThan(0)
  })

  it('renders member detail and edit links', () => {
    render(<MembersList members={members} errorMessage={undefined} />)

    expect(screen.getAllByRole('link', { name: 'Alex Morgan' })[0]).toHaveAttribute(
      'href',
      '/dashboard/members/member-1',
    )

    expect(screen.getAllByRole('link', { name: /edit/i })[0]).toHaveAttribute(
      'href',
      '/dashboard/members/member-1/edit',
    )

    expect(screen.getAllByRole('link', { name: /edit/i })[1]).toHaveAttribute(
      'href',
      '/dashboard/members/member-2/edit',
    )
  })
})
