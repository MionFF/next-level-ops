import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SingleSelect } from './single-select'

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

function renderSelect({ disabled = false } = {}) {
  const onChange = jest.fn()

  render(
    <SingleSelect
      label='Profile'
      name='profile'
      options={options}
      value='linked'
      disabled={disabled}
      onChange={onChange}
    />,
  )

  return { onChange }
}

describe('SingleSelect', () => {
  beforeEach(() => {
    mockDesktopViewport()
  })

  it('renders the current selected label', () => {
    renderSelect()

    expect(screen.getByRole('button', { name: 'Profile: Linked' })).toHaveTextContent('Linked')
  })

  it('opens and updates aria-expanded', async () => {
    const user = userEvent.setup()
    renderSelect()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects an option, closes, and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    const { onChange } = renderSelect()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.click(screen.getByRole('radio', { name: 'Profile: Unlinked' }))

    expect(onChange).toHaveBeenCalledWith('unlinked')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderSelect()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes on a desktop outside click', async () => {
    const user = userEvent.setup()
    renderSelect()
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)
    await user.click(document.body)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps closed content non-interactive', () => {
    renderSelect()

    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })
    const closedContent = document.getElementById(trigger.getAttribute('aria-controls') ?? '')

    expect(closedContent).toHaveAttribute('aria-hidden', 'true')
    expect(closedContent).toHaveAttribute('inert')
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })
    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })

    await user.click(trigger)

    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('constrains long lists and preserves responsive positioning', () => {
    const longOptions = Array.from({ length: 10 }, (_, index) => ({
      value: `option-${index}`,
      label: `Option ${index}`,
    }))

    render(
      <SingleSelect
        label='Long select'
        name='long-select'
        options={longOptions}
        value='option-0'
        onChange={jest.fn()}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Long select: Option 0' })
    const optionsContainer = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
    const optionsList = optionsContainer?.firstElementChild?.firstElementChild

    expect(optionsList).toHaveClass('max-h-64', 'overflow-y-auto', 'overscroll-contain')
    expect(optionsContainer).toHaveClass('static', 'md:absolute')
  })

  it('displays a placeholder without turning it into an option', () => {
    render(
      <SingleSelect
        label='Trainer'
        name='trainerId'
        options={[{ value: 'trainer-1', label: 'Sam Coach' }]}
        value=''
        placeholder='Select a trainer'
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Trainer: Select a trainer' })).toHaveTextContent(
      'Select a trainer',
    )
    expect(
      screen.queryByRole('radio', { name: 'Trainer: Select a trainer' }),
    ).not.toBeInTheDocument()
  })

  it('submits the controlled value through one hidden named input', async () => {
    const user = userEvent.setup()

    function FormHarness() {
      const [value, setValue] = useState<(typeof options)[number]['value']>('linked')

      return (
        <form data-testid='form'>
          <SingleSelect
            label='Profile'
            name='profile'
            options={options}
            value={value}
            onChange={setValue}
          />
        </form>
      )
    }

    render(<FormHarness />)

    await user.click(screen.getByRole('button', { name: 'Profile: Linked' }))
    await user.click(screen.getByRole('radio', { name: 'Profile: Unlinked' }))

    const form: HTMLFormElement = screen.getByTestId('form')
    const formData = new FormData(form)

    expect(formData.getAll('profile')).toEqual(['unlinked'])
  })

  it('omits its value from FormData when disabled', () => {
    render(
      <form data-testid='form'>
        <SingleSelect
          label='Profile'
          name='profile'
          options={options}
          value='linked'
          disabled
          onChange={jest.fn()}
        />
      </form>,
    )

    const form: HTMLFormElement = screen.getByTestId('form')

    expect(new FormData(form).has('profile')).toBe(false)
  })

  it('wires invalid and described-by state to the labeled trigger', () => {
    render(
      <>
        <SingleSelect
          label='Profile'
          name='profile'
          options={options}
          value='linked'
          aria-invalid
          aria-describedby='profile-error'
          onChange={jest.fn()}
        />
        <p id='profile-error'>Choose a valid profile.</p>
      </>,
    )

    const trigger = screen.getByRole('button', { name: 'Profile: Linked' })
    const optionsGroup = document.getElementById(trigger.getAttribute('aria-controls') ?? '')

    expect(optionsGroup).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAccessibleDescription('Choose a valid profile.')
  })
})
