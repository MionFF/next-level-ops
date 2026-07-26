import { expect, type Page } from '@playwright/test'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function selectOptionByText(page: Page, label: string, text: string) {
  const select = page.getByLabel(label)
  const option = select.getByRole('option', { name: new RegExp(escapeRegExp(text)) })

  await expect(option).toBeAttached({ timeout: 5_000 })

  const value = await option.getAttribute('value')

  if (!value) {
    throw new Error(`Could not find option value for "${text}" in "${label}" select`)
  }

  await select.selectOption(value)

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
