import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

export async function selectSingleOption(
  user: UserEvent,
  triggerName: RegExp | string,
  optionName: RegExp | string,
) {
  await user.click(screen.getByRole('button', { name: triggerName }))
  await user.click(screen.getByRole('radio', { name: optionName }))
}
