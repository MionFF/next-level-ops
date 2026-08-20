import { render, screen } from '@testing-library/react'
import type { Trainer } from '../model/trainer'
import TrainersList from './trainers-list'

const trainers: Trainer[] = [
  {
    id: 'trainer-1',
    full_name: 'Sam Coach',
    email: 'sam@example.com',
    phone: '+1 555 0202',
    specialty: 'Strength',
    status: 'active',
    created_at: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'trainer-2',
    full_name: 'Mia Trainer',
    email: 'mia@example.com',
    phone: null,
    specialty: null,
    status: 'inactive',
    created_at: '2026-05-21T10:00:00.000Z',
  },
]

describe('TrainersList', () => {
  it('renders error state when trainers fail to load', () => {
    render(<TrainersList trainers={[]} errorMessage='Database error' />)

    expect(screen.getByText('Failed to load trainers.')).toBeInTheDocument()
    expect(screen.queryByText('No trainers found.')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no trainers', () => {
    render(<TrainersList trainers={[]} errorMessage={undefined} />)

    expect(screen.getByText('No trainers found.')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load trainers.')).not.toBeInTheDocument()
  })

  it('renders trainer data and primary actions', () => {
    render(<TrainersList trainers={trainers} errorMessage={undefined} />)

    expect(screen.getByRole('heading', { name: /trainers/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /add trainer/i })).toHaveAttribute(
      'href',
      '/dashboard/trainers/new',
    )

    expect(screen.getAllByText('Sam Coach').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sam@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+1 555 0202').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Strength').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)

    expect(screen.getAllByText('Mia Trainer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('mia@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
  })

  it('renders fallback values and edit links', () => {
    render(<TrainersList trainers={trainers} errorMessage={undefined} />)

    expect(screen.getByText('No phone')).toBeInTheDocument()
    expect(screen.getByText('No specialty')).toBeInTheDocument()

    expect(screen.getAllByRole('link', { name: /edit/i })[0]).toHaveAttribute(
      'href',
      '/dashboard/trainers/trainer-1/edit',
    )

    expect(screen.getAllByRole('link', { name: /edit/i })[1]).toHaveAttribute(
      'href',
      '/dashboard/trainers/trainer-2/edit',
    )
  })
})
