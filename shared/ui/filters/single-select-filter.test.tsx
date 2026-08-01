import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SingleSelectFilter } from './single-select-filter'

const options = [
  { value: 'all', label: 'All profiles' },
  { value: 'linked', label: 'Linked' },
  { value: 'unlinked', label: 'Unlinked' },
] as const

function mockDesktopViewport() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

function renderFilter({ disabled = false } = {}) {
  const onChange = jest.fn()

  render(
    <SingleSelectFilter
      label='Profile'
      name='profile-filter'
      options={options}
      value='linked'
      disabled={disabled}
      onChange={onChange}
    />,
  )

  return { onChange }
}

describe('SingleSelectFilter', () => {
  beforeEach(() => {
    mockDesktopViewport()
  })

  it('renders the current selected label', () => {
    renderFilter()

    expect(screen.getByRole('button', { name: 'Profile: Linked' })).toHaveTextContent('Linked')
  })

  it('opens and updates aria-expanded', async () => {
    const user = userEvent.setup()
    renderFilter()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects an option, closes, and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilter()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.click(screen.getByLabelText('Profile: Unlinked'))

    expect(onChange).toHaveBeenCalledWith('unlinked')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderFilter()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes on a desktop outside click', async () => {
    const user = userEvent.setup()
    renderFilter()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.click(document.body)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps closed content non-interactive', () => {
    renderFilter()

    const closedContent = screen.getByLabelText('Profile: All profiles').closest('[aria-hidden]')

    expect(closedContent).toHaveAttribute('aria-hidden', 'true')
    expect(closedContent).toHaveAttribute('inert')
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    renderFilter({ disabled: true })
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)

    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('constrains and scrolls a long options list', () => {
    const longOptions = Array.from({ length: 10 }, (_, index) => ({
      value: `option-${index}`,
      label: `Option ${index}`,
    }))

    render(
      <SingleSelectFilter
        label='Long filter'
        name='long-filter'
        options={longOptions}
        value='option-0'
        onChange={jest.fn()}
      />,
    )

    const selectedOption = screen
      .getAllByLabelText('Long filter: Option 0')
      .find(element => element instanceof HTMLInputElement)
    const optionsList = selectedOption?.parentElement?.parentElement

    expect(optionsList).toHaveClass('max-h-64', 'overflow-y-auto', 'overscroll-contain')
  })
})
