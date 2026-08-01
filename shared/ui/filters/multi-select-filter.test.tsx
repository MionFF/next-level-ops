import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelectFilter } from './multi-select-filter'

const options = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
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

type OptionValue = (typeof options)[number]['value']

type RenderFilterOptions = {
  selectedValues?: readonly OptionValue[]
  disabled?: boolean
}

function renderFilter({ selectedValues = [], disabled = false }: RenderFilterOptions = {}) {
  const onToggle = jest.fn()

  render(
    <MultiSelectFilter
      label='Member status'
      options={options}
      selectedValues={selectedValues}
      disabled={disabled}
      onToggle={onToggle}
    />,
  )

  return { onToggle }
}

describe('MultiSelectFilter', () => {
  beforeEach(() => {
    mockDesktopViewport()
  })

  it('renders All when empty', () => {
    renderFilter()

    expect(screen.getByRole('button', { name: 'Member status: All' })).toHaveTextContent('All')
  })

  it('renders one selected option label', () => {
    renderFilter({ selectedValues: ['paused'] })

    expect(screen.getByRole('button', { name: 'Member status: Paused' })).toHaveTextContent(
      'Paused',
    )
  })

  it('renders the selected count for multiple values', () => {
    renderFilter({ selectedValues: ['active', 'paused'] })

    expect(screen.getByRole('button', { name: 'Member status: 2 selected' })).toHaveTextContent(
      '2 selected',
    )
  })

  it('toggles an option and remains open', async () => {
    const user = userEvent.setup()
    const { onToggle } = renderFilter()
    const trigger = screen.getByRole('button', { name: 'Member status: All' })

    await user.click(trigger)
    await user.click(screen.getByLabelText('Member status: Active'))

    expect(onToggle).toHaveBeenCalledWith('active')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderFilter()
    const trigger = screen.getByRole('button', { name: 'Member status: All' })

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes on a desktop outside click', async () => {
    const user = userEvent.setup()
    renderFilter()
    const trigger = screen.getByRole('button', { name: 'Member status: All' })

    await user.click(trigger)
    await user.click(document.body)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps closed content non-interactive', () => {
    renderFilter()

    const closedContent = screen.getByLabelText('Member status: Active').closest('[aria-hidden]')

    expect(closedContent).toHaveAttribute('aria-hidden', 'true')
    expect(closedContent).toHaveAttribute('inert')
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    renderFilter({ disabled: true })
    const trigger = screen.getByRole('button', { name: 'Member status: All' })

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
      <MultiSelectFilter
        label='Long filter'
        options={longOptions}
        selectedValues={[]}
        onToggle={jest.fn()}
      />,
    )

    const optionsList = screen.getByLabelText('Long filter: Option 0').parentElement?.parentElement

    expect(optionsList).toHaveClass('max-h-64', 'overflow-y-auto', 'overscroll-contain')
  })
})
