import { expect, type Page } from '@playwright/test'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function selectOptionByText(page: Page, label: string, text: string) {
  await waitForAppReady(page)

  const trigger = page.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(label)}:`, 'i'),
  })

  await expect(trigger).toBeVisible()
  await trigger.click()

  const group = page.getByRole('radiogroup', {
    name: `${label} options`,
    exact: true,
  })
  // Callers may identify structured labels by a full title/name segment or appended metadata,
  // such as the email in "Name — email".
  const option = group.getByRole('radio', {
    name: new RegExp(
      `^${escapeRegExp(label)}: (?:.*\\s+—\\s+)?${escapeRegExp(text)}(?:$|\\s+—\\s+)`,
      'i',
    ),
  })

  await expect(option).toBeVisible({ timeout: 5_000 })

  const value = await option.inputValue()

  if (!value) {
    throw new Error(`Could not find option value for "${text}" in "${label}" select`)
  }

  if (await option.isChecked()) {
    await page.keyboard.press('Escape')
  } else {
    await option.locator('xpath=ancestor::label[1]').click()
  }

  await expect(trigger).toContainText(text)

  return value
}

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded')

  // Next exposes this marker in test mode after React hydration,
  // preventing native form submission before Server Actions are attached.
  await page.waitForFunction(() => Reflect.get(window, '__NEXT_HYDRATED') === true, undefined, {
    timeout: 15_000,
  })
}
