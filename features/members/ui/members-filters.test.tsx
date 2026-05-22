import { render, screen } from '@testing-library/react'
import MembersFilters from './members-filters'

describe('MembersFilters', () => {
  it('renders search and status filters with current values', () => {
    render(<MembersFilters search='alex' status='paused' />)

    expect(screen.getByLabelText(/search/i)).toHaveValue('alex')
    expect(screen.getByLabelText(/status/i)).toHaveValue('paused')

    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /reset/i })).toHaveAttribute(
      'href',
      '/dashboard/members',
    )
  })

  it('renders all status options', () => {
    render(<MembersFilters search='' status='all' />)

    expect(screen.getByRole('option', { name: /all/i })).toHaveValue('all')
    expect(screen.getByRole('option', { name: /^active/i })).toHaveValue('active')
    expect(screen.getByRole('option', { name: /paused/i })).toHaveValue('paused')
    expect(screen.getByRole('option', { name: /inactive/i })).toHaveValue('inactive')
  })
})
