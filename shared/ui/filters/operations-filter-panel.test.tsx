import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OperationsFilterPanel } from './operations-filter-panel'

describe('OperationsFilterPanel', () => {
  it.each([
    [0, 'No active filters'],
    [1, '1 active filter'],
    [3, '3 active filters'],
  ])('summarizes %i applied filter groups', (activeFilterCount, summary) => {
    render(
      <OperationsFilterPanel activeFilterCount={activeFilterCount} onSubmit={jest.fn()}>
        <label htmlFor='shared-filter'>Shared filter</label>
        <input id='shared-filter' />
      </OperationsFilterPanel>,
    )

    expect(screen.getByRole('button', { name: /^filters\b/i })).toHaveTextContent(summary)
  })

  it('connects the mobile toggle to the collapsible panel and updates its state', async () => {
    const user = userEvent.setup()

    render(
      <OperationsFilterPanel activeFilterCount={0} onSubmit={jest.fn()}>
        <p>Filter fields</p>
      </OperationsFilterPanel>,
    )

    const toggle = screen.getByRole('button', { name: /^filters\b/i, expanded: false })
    const panelId = toggle.getAttribute('aria-controls')

    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId ?? '')).toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
